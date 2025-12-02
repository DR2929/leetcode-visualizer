import Database, { type Database as DatabaseType } from "better-sqlite3";
import path from "path";
import fs from "fs";

// Check if we're on Vercel (serverless) - SQLite won't work there
const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV;

let db: DatabaseType | null = null;

if (!isVercel) {
  // Only initialize SQLite if not on Vercel
  try {
    // Use persistent storage location that works on Railway
    // Railway persists files in the project directory
    const dbPath = path.join(process.cwd(), "data", "leetcode.db");
    const dbDir = path.dirname(dbPath);

    console.log(`[DB] Initializing database at: ${dbPath}`);
    console.log(`[DB] Current working directory: ${process.cwd()}`);
    console.log(`[DB] Database directory exists: ${fs.existsSync(dbDir)}`);

    // Ensure data directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`[DB] Created database directory: ${dbDir}`);
    }

    // Check if database file exists
    const dbExists = fs.existsSync(dbPath);
    console.log(`[DB] Database file exists: ${dbExists}`);

    db = new Database(dbPath);
    console.log(`[DB] Database connection opened successfully`);
    
    // Initialize schema immediately after opening
    initDatabase();
    
    // Verify we can query (after schema is created)
    try {
      const testQuery = db.prepare("SELECT COUNT(*) as count FROM problems");
      const count = testQuery.get() as { count: number };
      console.log(`[DB] Current problem count in database: ${count.count}`);
    } catch (error: any) {
      if (error?.code === 'SQLITE_ERROR' && error?.message?.includes('no such table')) {
        console.log(`[DB] Tables don't exist yet - will be created by initDatabase`);
      } else {
        console.error(`[DB] Error checking problem count:`, error);
      }
    }
  } catch (error: any) {
    console.error("[DB] Failed to initialize SQLite database:", error);
    console.error("[DB] Error details:", error?.message, error?.stack);
    db = null;
  }
} else {
  console.log("[DB] Running on Vercel - database disabled");
}

// Enable foreign keys (only if db is initialized)
if (db) {
  db.pragma("foreign_keys = ON");
}

// Initialize database schema
export function initDatabase() {
  if (!db) {
    console.warn("[DB] Database not available (likely on Vercel serverless). Using fallback mode.");
    return;
  }
  
  try {
    console.log("[DB] Initializing database schema...");
    
    // Problems table
    db.exec(`
    CREATE TABLE IF NOT EXISTS problems (
      id INTEGER PRIMARY KEY,
      problem_number INTEGER UNIQUE NOT NULL,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      difficulty TEXT NOT NULL,
      description TEXT,
      constraints TEXT,
      topics TEXT, -- JSON array
      patterns TEXT, -- JSON array
      url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Explanations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS explanations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      problem_id INTEGER NOT NULL,
      language TEXT NOT NULL,
      mode TEXT NOT NULL, -- beginner, intermediate, advanced
      solution_code TEXT NOT NULL,
      explanation_data TEXT NOT NULL, -- JSON
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
      UNIQUE(problem_id, language, mode)
    )
  `);

  // Images table
  db.exec(`
    CREATE TABLE IF NOT EXISTS explanation_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      problem_id INTEGER NOT NULL,
      step_number INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      image_data BLOB,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
      UNIQUE(problem_id, step_number)
    )
  `);

    // Create indexes
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_problems_number ON problems(problem_number);
      CREATE INDEX IF NOT EXISTS idx_problems_slug ON problems(slug);
      CREATE INDEX IF NOT EXISTS idx_explanations_problem ON explanations(problem_id);
      CREATE INDEX IF NOT EXISTS idx_images_problem ON explanation_images(problem_id);
    `);
    
    console.log("[DB] Database schema initialized successfully");
    
    // Verify tables exist
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('problems', 'explanations', 'explanation_images')
    `).all() as { name: string }[];
    
    console.log(`[DB] Tables created: ${tables.map(t => t.name).join(", ")}`);
  } catch (error: any) {
    console.error("[DB] Error initializing database schema:", error);
    console.error("[DB] Error details:", error?.message);
    throw error; // Re-throw so we know initialization failed
  }
}

// Schema initialization is now called immediately after database connection is opened
// This ensures tables are created before any queries are attempted

export interface Problem {
  id: number;
  problem_number: number;
  title: string;
  slug: string;
  difficulty: string;
  description: string | null;
  constraints: string | null;
  topics: string[];
  patterns: string[];
  url: string | null;
}

export interface Explanation {
  id: number;
  problem_id: number;
  language: string;
  mode: string;
  solution_code: string;
  explanation_data: string;
}

export interface ExplanationImage {
  id: number;
  problem_id: number;
  step_number: number;
  image_url: string;
  image_data: Buffer | null;
}

// Problem queries
export const problems = {
  getAll: () => {
    if (!db) {
      console.warn("[DB] Database not available, returning empty array");
      return [];
    }
    try {
      const stmt = db.prepare("SELECT * FROM problems ORDER BY problem_number");
      const results = stmt.all() as any[];
      return results.map((result) => ({
        ...result,
        topics: typeof result.topics === "string" ? JSON.parse(result.topics) : result.topics,
        patterns: typeof result.patterns === "string" ? JSON.parse(result.patterns) : result.patterns,
      })) as Problem[];
    } catch (error) {
      console.error("[DB] Error in getAll:", error);
      return [];
    }
  },

  getByNumber: (number: number) => {
    if (!db) {
      console.warn(`[DB] Database not available, cannot get problem ${number}`);
      return undefined;
    }
    try {
      const stmt = db.prepare("SELECT * FROM problems WHERE problem_number = ?");
      const result = stmt.get(number) as any;
      if (!result) return undefined;
      return {
        ...result,
        topics: typeof result.topics === "string" ? JSON.parse(result.topics) : result.topics,
        patterns: typeof result.patterns === "string" ? JSON.parse(result.patterns) : result.patterns,
      } as Problem;
    } catch (error) {
      console.error(`[DB] Error in getByNumber(${number}):`, error);
      return undefined;
    }
  },

  search: (query: string, limit: number = 20) => {
    if (!db) {
      console.warn(`[DB] Database not available, cannot search for "${query}"`);
      return [];
    }
    try {
      // Check if query is a number (for problem_number search)
      const queryNum = parseInt(query.trim());
      const isNumeric = !isNaN(queryNum);
      
      let stmt;
      let results: any[];
      
      if (isNumeric) {
        // If query is a number, search by exact problem_number first, then title/slug
        console.log(`[DB] Searching for problem number: ${queryNum}`);
        stmt = db.prepare(`
          SELECT * FROM problems 
          WHERE problem_number = ? OR problem_number LIKE ? OR title LIKE ? OR slug LIKE ?
          ORDER BY 
            CASE WHEN problem_number = ? THEN 1 ELSE 2 END,
            problem_number
          LIMIT ?
        `);
        const searchTerm = `%${query}%`;
        results = stmt.all(queryNum, searchTerm, searchTerm, searchTerm, queryNum, limit) as any[];
      } else {
        // Text search in title and slug
        console.log(`[DB] Searching for text: "${query}"`);
        stmt = db.prepare(`
          SELECT * FROM problems 
          WHERE title LIKE ? OR slug LIKE ?
          ORDER BY problem_number
          LIMIT ?
        `);
        const searchTerm = `%${query}%`;
        results = stmt.all(searchTerm, searchTerm, limit) as any[];
      }
      
      console.log(`[DB] Found ${results.length} results for "${query}"`);
      
      return results.map((result) => ({
        ...result,
        topics: typeof result.topics === "string" ? JSON.parse(result.topics) : result.topics,
        patterns: typeof result.patterns === "string" ? JSON.parse(result.patterns) : result.patterns,
      })) as Problem[];
    } catch (error: any) {
      console.error(`[DB] Error in search("${query}"):`, error);
      console.error(`[DB] Error details:`, error?.message, error?.stack);
      return [];
    }
  },

  insert: (problem: Omit<Problem, "id">) => {
    if (!db) return { lastInsertRowid: 0, changes: 0 };
    const stmt = db.prepare(`
      INSERT INTO problems (problem_number, title, slug, difficulty, description, constraints, topics, patterns, url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      problem.problem_number,
      problem.title,
      problem.slug,
      problem.difficulty,
      problem.description,
      problem.constraints,
      JSON.stringify(problem.topics),
      JSON.stringify(problem.patterns),
      problem.url
    );
  },

  update: (id: number, problem: Partial<Problem>) => {
    if (!db) return;
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(problem).forEach(([key, value]) => {
      if (value !== undefined && key !== "id") {
        fields.push(`${key} = ?`);
        values.push(
          key === "topics" || key === "patterns" ? JSON.stringify(value) : value
        );
      }
    });

    if (fields.length === 0) return;

    values.push(id);
    const stmt = db.prepare(
      `UPDATE problems SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    );
    return stmt.run(...values);
  },
};

// Explanation queries
export const explanations = {
  get: (problemId: number, language: string, mode: string) => {
    if (!db) return undefined;
    const stmt = db.prepare(
      "SELECT * FROM explanations WHERE problem_id = ? AND language = ? AND mode = ?"
    );
    return stmt.get(problemId, language, mode) as Explanation | undefined;
  },

  insert: (
    problemId: number,
    language: string,
    mode: string,
    solutionCode: string,
    explanationData: any
  ) => {
    if (!db) return { lastInsertRowid: 0, changes: 0 };
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO explanations (problem_id, language, mode, solution_code, explanation_data)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(
      problemId,
      language,
      mode,
      solutionCode,
      JSON.stringify(explanationData)
    );
  },
};

// Image queries
export const images = {
  get: (problemId: number, stepNumber: number) => {
    if (!db) return undefined;
    const stmt = db.prepare(
      "SELECT * FROM explanation_images WHERE problem_id = ? AND step_number = ?"
    );
    return stmt.get(problemId, stepNumber) as ExplanationImage | undefined;
  },

  getAllForProblem: (problemId: number) => {
    if (!db) return [];
    const stmt = db.prepare(
      "SELECT * FROM explanation_images WHERE problem_id = ? ORDER BY step_number"
    );
    return stmt.all(problemId) as ExplanationImage[];
  },

  insert: (
    problemId: number,
    stepNumber: number,
    imageUrl: string,
    imageData?: Buffer
  ) => {
    if (!db) return { lastInsertRowid: 0, changes: 0 };
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO explanation_images (problem_id, step_number, image_url, image_data)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(problemId, stepNumber, imageUrl, imageData || null);
  },
};

export default db;

