import axios from "axios";
import { problems, initDatabase } from "../lib/db";

// LeetCode GraphQL endpoint
const LEETCODE_API = "https://leetcode.com/graphql/";

interface LeetCodeProblem {
  questionId: string;
  questionFrontendId: string;
  title: string;
  titleSlug: string;
  difficulty: string;
  content: string;
  topicTags: Array<{ name: string; slug: string }>;
}

async function fetchLeetCodeProblems(limit: number = 100) {
  const query = `
    query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
      problemsetQuestionList: questionList(
        categorySlug: $categorySlug
        limit: $limit
        skip: $skip
        filters: $filters
      ) {
        total: totalNum
        questions: data {
          questionId
          questionFrontendId
          title
          titleSlug
          difficulty
          topicTags {
            name
            slug
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post(LEETCODE_API, {
      query,
      variables: {
        categorySlug: "",
        limit,
        skip: 0,
        filters: {},
      },
    });

    return response.data.data.problemsetQuestionList.questions;
  } catch (error) {
    console.error("Error fetching LeetCode problems:", error);
    throw error;
  }
}

async function fetchProblemDetails(slug: string): Promise<{
  content: string;
  constraints: string;
} | null> {
  const query = `
    query questionContent($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        content
        mysqlSchemas
        dataSchemas
      }
    }
  `;

  try {
    const response = await axios.post(LEETCODE_API, {
      query,
      variables: { titleSlug: slug },
    });

    const question = response.data.data.question;
    if (!question) return null;

    // Extract constraints from content (usually in a <p><strong>Constraints:</strong> format)
    const content = question.content || "";
    const constraintsMatch = content.match(
      /<p><strong>Constraints:<\/strong><\/p>([\s\S]*?)(?=<p><strong>|$)/
    );
    const constraints = constraintsMatch
      ? constraintsMatch[1].replace(/<[^>]*>/g, "").trim()
      : "";

    return {
      content: content.replace(/<[^>]*>/g, "").substring(0, 1000), // Limit description length
      constraints,
    };
  } catch (error) {
    console.error(`Error fetching details for ${slug}:`, error);
    return null;
  }
}

async function seedDatabase() {
  // Note: initDatabase() is already called when lib/db is imported
  // We just need to verify schema exists, but don't call initDatabase again
  // to avoid duplicate initialization
  try {
    const { problems } = await import("../lib/db");
    const count = problems.getAll().length;
    if (count > 0) {
      console.log(`Database already has ${count} problems. Skipping seed.`);
      return;
    }
    console.log("Database is empty. Proceeding with seed...");
  } catch (error: any) {
    console.error("Failed to check database:", error?.message);
    // Continue anyway - initDatabase should have been called already
  }

  console.log("Fetching LeetCode problems...");
  const leetcodeProblems = await fetchLeetCodeProblems(200); // Fetch first 200 problems

  console.log(`Found ${leetcodeProblems.length} problems. Seeding database...`);

  let inserted = 0;
  let skipped = 0;

  for (const problem of leetcodeProblems) {
    try {
      // Check if problem already exists
      const existing = problems.getByNumber(parseInt(problem.questionFrontendId));
      if (existing) {
        skipped++;
        continue;
      }

      // Fetch problem details
      const details = await fetchProblemDetails(problem.titleSlug);
      
      // Map difficulty
      const difficultyMap: Record<string, string> = {
        Easy: "Easy",
        Medium: "Medium",
        Hard: "Hard",
      };

      // Insert problem
      problems.insert({
        problem_number: parseInt(problem.questionFrontendId),
        title: problem.title,
        slug: problem.titleSlug,
        difficulty: difficultyMap[problem.difficulty] || problem.difficulty,
        description: details?.content || null,
        constraints: details?.constraints || null,
        topics: problem.topicTags.map((tag: { name: string; slug: string }) => tag.name),
        patterns: [], // Will be populated by GPT analysis
        url: `https://leetcode.com/problems/${problem.titleSlug}/`,
      });

      inserted++;
      console.log(`Inserted: ${problem.questionFrontendId}. ${problem.title}`);

      // Rate limiting - wait 200ms between requests
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error: any) {
      console.error(
        `Error processing problem ${problem.questionFrontendId}:`,
        error?.message || error
      );
      // Continue with next problem even if one fails
    }
  }

  console.log(`\nSeeding complete!`);
  console.log(`Inserted: ${inserted} problems`);
  console.log(`Skipped: ${skipped} existing problems`);
  
  if (inserted === 0 && skipped > 0) {
    console.log(`\nAll problems already exist in database. To re-seed, delete data/leetcode.db first.`);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("Done!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}

export { seedDatabase };

