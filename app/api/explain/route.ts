import { NextRequest, NextResponse } from "next/server";
import { ExplanationData, UserMode } from "@/types";
import OpenAI from "openai";
import { problems, explanations, images } from "@/lib/db";

// Initialize OpenAI client if API key is available
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Helper function to ensure arrays are present in all steps
function ensureArraysInSteps(data: any, problem: any): any {
  if (!data.steps || data.steps.length === 0) return data;

  let defaultArray: any[] | null = null;
  let arrayKey: string = "nums"; // Default key name
  
  // Try to find array in any step (check all possible array variable names)
  for (const step of data.steps || []) {
    if (step.variables) {
      for (const [key, value] of Object.entries(step.variables)) {
        const keyLower = key.toLowerCase();
        // Check if it's an array and matches common array variable names
        if (Array.isArray(value)) {
          // Check if key matches any common array name pattern
          if (
            keyLower.includes("nums") ||
            keyLower.includes("arr") ||
            keyLower.includes("array") ||
            keyLower.includes("list") ||
            keyLower === "s" ||
            keyLower === "str" ||
            keyLower.includes("string")
          ) {
            defaultArray = value as any[];
            arrayKey = key; // Use the actual key name from GPT
            break;
          }
          // If it's an array but key doesn't match, still use it as fallback
          if (!defaultArray) {
            defaultArray = value as any[];
            arrayKey = key;
          }
        }
      }
      if (defaultArray) break;
    }
  }

  // If no array found, try to infer from problem description
  if (!defaultArray) {
    const desc = problem.description || "";
    // Try multiple patterns to extract array
    const patterns = [
      /\[([\d,\s]+)\]/g, // [2, 7, 11, 15]
      /nums\s*=\s*\[([^\]]+)\]/i, // nums = [2, 7, 11, 15]
      /array\s*=\s*\[([^\]]+)\]/i, // array = [2, 7, 11, 15]
    ];
    
    for (const pattern of patterns) {
      const match = desc.match(pattern);
      if (match) {
        try {
          const arrayStr = match[1] || match[0];
          defaultArray = JSON.parse(`[${arrayStr.replace(/[\[\]]/g, "")}]`);
          arrayKey = "nums";
          break;
        } catch (e) {
          // Continue to next pattern
        }
      }
    }
  }

  // Final fallback - use a default example array
  if (!defaultArray) {
    defaultArray = [2, 7, 11, 15];
    arrayKey = "nums";
    console.log(`No array found in steps for problem ${problem.problem_number}, using default: ${arrayKey}`);
  }

  // Ensure EVERY step has the array variable
  if (defaultArray && arrayKey && data.steps) {
    data.steps = data.steps.map((step: any) => {
      if (!step.variables) {
        step.variables = {};
      }
      // Check if array exists with any key name
      const hasArray = Object.values(step.variables).some(v => Array.isArray(v));
      // If no array exists, add it
      if (!hasArray || !step.variables[arrayKey]) {
        step.variables[arrayKey] = [...defaultArray];
      }
      return step;
    });
    console.log(`Ensured array "${arrayKey}" is present in all ${data.steps.length} steps`);
  }

  return data;
}

async function generateSolutionAndExplanation(
  problemNumber: number,
  language: string,
  mode: UserMode
): Promise<ExplanationData> {
  if (!openai) {
    throw new Error("OpenAI API key is required. Please set OPENAI_API_KEY in .env.local");
  }

  // Get problem from database
  const problem = problems.getByNumber(problemNumber);
  if (!problem) {
    throw new Error(`Problem ${problemNumber} not found in database`);
  }

  // Check if explanation is cached
  const cached = explanations.get(problem.id, language, mode);
  if (cached) {
    console.log(`Using cached explanation for problem ${problemNumber}`);
    const explanationData = JSON.parse(cached.explanation_data);
    explanationData.code = cached.solution_code;
    
    // Post-process cached data to ensure arrays are present (fix for old cached data)
    const processedData = ensureArraysInSteps(explanationData, problem);
    return processedData as ExplanationData;
  }

  // Generate solution and explanation using GPT
  console.log(`Generating solution for problem ${problemNumber}...`);

  const modeInstructions = {
    beginner: "Explain in detail with syntax tips. Assume the user is new to coding.",
    intermediate: "Focus on algorithm patterns and intuition. Assume basic syntax knowledge.",
    advanced: "Be concise. Focus on the key idea, pattern, and complexity.",
  };

  const languageName = language === "cpp" ? "C++" : language === "java" ? "Java" : "Python";

  const prompt = `You are an expert algorithm tutor. Generate an optimal solution for LeetCode problem #${problemNumber}: ${problem.title}

Problem Description:
${problem.description || "N/A"}

Constraints:
${problem.constraints || "N/A"}

Difficulty: ${problem.difficulty}
Topics: ${Array.isArray(problem.topics) ? problem.topics.join(", ") : JSON.parse(problem.topics as any).join(", ")}

Generate:
1. An optimal solution in ${languageName}
2. A comprehensive explanation tailored for ${mode} mode
3. Step-by-step execution details with variable states

Mode: ${mode}
${modeInstructions[mode]}

Provide a JSON response with this exact structure:
{
  "topic": ["Array", "Hash Map"],
  "pattern": ["Lookup Table"],
  "algorithm": "Single-pass hash map",
  "intuition": "Brief explanation of the approach...",
  "steps": [
    {
      "step": 1,
      "description": "What happens in this step",
      "variables": {"nums": [2, 7, 11, 15], "i": 0, "num": 2, "map": {}, "target": 9}
    }
  ],
  "code_explanation": [
    {"line": 1, "code": "for i, num in enumerate(nums):", "explanation": "Explanation..."}
  ],
  "syntax_tips": ["Tip 1", "Tip 2"],
  "complexity": {
    "time": "O(n)",
    "space": "O(n)",
    "reasoning": "Why this complexity..."
  },
  "problem_title": "${problem.title}",
  "problem_description": "${(problem.description || "").substring(0, 500)}",
  "constraints": "${problem.constraints || ""}",
  "solution_code": "The complete ${languageName} solution code here"
}

CRITICAL REQUIREMENTS FOR STEP VARIABLES:
- EVERY step MUST include the input array with its full values (e.g., "nums": [2, 7, 11, 15])
- The array variable name should match the problem (commonly "nums", "arr", "array", "s", "str")
- Include ALL relevant variables in EVERY step:
  * The input array (always present)
  * Index variables (i, j, left, right, start, end) when iterating
  * Current element (num, val, current) when processing
  * Hash maps/dictionaries (map, dict, hash) - use {} for empty
  * Other problem-specific variables (target, sum, complement, etc.)
- For arrays, use actual example values from the problem description
- For hash maps, show key-value pairs (use {} for empty maps initially)
- Each step should show the state AFTER that step's operation

Example of correct step variables:
Step 1: {"nums": [2, 7, 11, 15], "i": 0, "num": 2, "map": {}, "target": 9}
Step 2: {"nums": [2, 7, 11, 15], "i": 1, "num": 7, "map": {"2": 0}, "target": 9}

The solution_code field should contain the complete, runnable solution.
Make sure the code_explanation matches the solution_code line by line.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an expert algorithm tutor. Always respond with valid JSON only, no markdown formatting.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const responseText = completion.choices[0]?.message?.content;
  if (!responseText) {
    throw new Error("No response from OpenAI");
  }

  try {
    const parsed = JSON.parse(responseText);
    const solutionCode = parsed.solution_code || "";
    
    // Extract code from solution_code field
    delete parsed.solution_code;
    parsed.code = solutionCode;

    // Post-process steps to ensure arrays are included
    const processedData = ensureArraysInSteps(parsed, problem);

    // Cache the explanation (with arrays ensured)
    explanations.insert(problem.id, language, mode, solutionCode, processedData);

    // Image generation is optional - can be enabled via environment variable
    // For now, we use React/SVG visualizations instead of DALL-E images
    if (process.env.GENERATE_IMAGES === "true") {
      await generateAndCacheImages(problem.id, processedData.steps || []);
    }

    return processedData as ExplanationData;
  } catch (error) {
    console.error("Failed to parse OpenAI response:", error);
    throw new Error("Invalid response format from OpenAI");
  }
}

async function generateAndCacheImages(problemId: number, steps: any[]) {
  if (!openai) return;

  // Check which images are already cached
  const cachedImages = images.getAllForProblem(problemId);
  const cachedStepNumbers = new Set(cachedImages.map((img) => img.step_number));

  // Generate images for steps that don't have cached images
  for (const step of steps) {
    if (cachedStepNumbers.has(step.step)) {
      console.log(`Image for step ${step.step} already cached`);
      continue;
    }

    try {
      console.log(`Generating image for step ${step.step}...`);
      const imagePrompt = `Create a clear, educational diagram showing:
- Step ${step.step}: ${step.description}
- Variables: ${JSON.stringify(step.variables)}
- Show data structures (arrays, hash maps, etc.) visually
- Use clear labels and arrows
- Make it suitable for algorithm visualization`;

      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: imagePrompt,
        size: "1024x1024",
        quality: "standard",
        n: 1,
      });

      const imageUrl = imageResponse.data?.[0]?.url;
      if (imageUrl) {
        // Download and cache the image
        const imageData = await fetch(imageUrl).then((res) => res.arrayBuffer());
        images.insert(problemId, step.step, imageUrl, Buffer.from(imageData));
        console.log(`Cached image for step ${step.step}`);
      }

      // Rate limiting - wait 1 second between image generations
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error generating image for step ${step.step}:`, error);
      // Continue with other steps even if one fails
    }
  }
}

async function getCachedImage(problemId: number, stepNumber: number): Promise<string | null> {
  const image = images.get(problemId, stepNumber);
  if (image && image.image_url) {
    return image.image_url;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { problemNumber, language, mode } = body;

    if (!problemNumber) {
      return NextResponse.json(
        { error: "Problem number is required" },
        { status: 400 }
      );
    }

    if (!language) {
      return NextResponse.json(
        { error: "Language is required" },
        { status: 400 }
      );
    }

    // Generate solution and explanation
    const explanation = await generateSolutionAndExplanation(
      problemNumber,
      language,
      (mode || "intermediate") as UserMode
    );

    // Note: We now use React/SVG visualizations instead of DALL-E images
    // Image URLs are kept in the response for backward compatibility
    // but the Visualizer component uses step variables to render dynamically
    const problem = problems.getByNumber(problemNumber);
    if (problem && process.env.USE_CACHED_IMAGES === "true") {
      explanation.steps = await Promise.all(
        (explanation.steps || []).map(async (step) => {
          const imageUrl = await getCachedImage(problem.id, step.step);
          return {
            ...step,
            image_url: imageUrl || undefined,
          };
        })
      );
    }

    return NextResponse.json(explanation);
  } catch (error: any) {
    console.error("Error generating explanation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate explanation" },
      { status: 500 }
    );
  }
}
