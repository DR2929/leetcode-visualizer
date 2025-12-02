import Database, { type Database as DatabaseType } from "better-sqlite3";
import path from "path";
import fs from "fs";

// Check if we're on Vercel (serverless) - SQLite won't work there
const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV;

let db: DatabaseType | null = null;

if (!isVercel) {
  // Only initialize SQLite if not on Vercel
  try {
    const dbPath = path.join(process.cwd(), "data", "leetcode.db");
    const dbDir = path.dirname(dbPath);

    // Ensure data directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new Database(dbPath);
  } catch (error) {
    console.error("Failed to initialize SQLite database:", error);
    db = null;
  }
}

// Enable foreign keys (only if db is initialized)
if (db) {
  db.pragma("foreign_keys = ON");
}

// Initialize database schema
export function initDatabase() {
  if (!db) {
    console.warn("Database not available (likely on Vercel serverless). Using fallback mode.");
    return;
  }
  
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
}

// Initialize on import (with error handling)
try {
  initDatabase();
} catch (error) {
  console.error("Failed to initialize database schema:", error);
  // Continue without database - app will work but without caching
}

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
    if (!db) return [];
    const stmt = db.prepare("SELECT * FROM problems ORDER BY problem_number");
    const results = stmt.all() as any[];
    return results.map((result) => ({
      ...result,
      topics: typeof result.topics === "string" ? JSON.parse(result.topics) : result.topics,
      patterns: typeof result.patterns === "string" ? JSON.parse(result.patterns) : result.patterns,
    })) as Problem[];
  },

  getByNumber: (number: number) => {
    if (!db) return undefined;
    const stmt = db.prepare("SELECT * FROM problems WHERE problem_number = ?");
    const result = stmt.get(number) as any;
    if (!result) return undefined;
    return {
      ...result,
      topics: typeof result.topics === "string" ? JSON.parse(result.topics) : result.topics,
      patterns: typeof result.patterns === "string" ? JSON.parse(result.patterns) : result.patterns,
    } as Problem;
  },

  search: (query: string, limit: number = 20) => {
    if (!db) return [];
    const stmt = db.prepare(`
      SELECT * FROM problems 
      WHERE problem_number LIKE ? OR title LIKE ? OR slug LIKE ?
      ORDER BY problem_number
      LIMIT ?
    `);
    const searchTerm = `%${query}%`;
    const results = stmt.all(searchTerm, searchTerm, searchTerm, limit) as any[];
    return results.map((result) => ({
      ...result,
      topics: typeof result.topics === "string" ? JSON.parse(result.topics) : result.topics,
      patterns: typeof result.patterns === "string" ? JSON.parse(result.patterns) : result.patterns,
    })) as Problem[];
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

