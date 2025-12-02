import { NextRequest, NextResponse } from "next/server";
import { problems, images } from "@/lib/db";

/**
 * Optional endpoint to generate and cache images for a specific problem step.
 * This can be used to pre-generate images for export or sharing purposes.
 * 
 * Note: The main app uses React/SVG visualizations, but this endpoint
 * allows generating static images if needed.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { problemNumber, stepNumber, imageDataUrl } = body;

    if (!problemNumber || !stepNumber || !imageDataUrl) {
      return NextResponse.json(
        { error: "problemNumber, stepNumber, and imageDataUrl are required" },
        { status: 400 }
      );
    }

    const problem = problems.getByNumber(problemNumber);
    if (!problem) {
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 }
      );
    }

    // Convert data URL to buffer
    const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    // Store in database
    images.insert(
      problem.id,
      stepNumber,
      imageDataUrl, // Store data URL as URL
      imageBuffer
    );

    return NextResponse.json({
      success: true,
      message: `Image cached for problem ${problemNumber}, step ${stepNumber}`,
    });
  } catch (error: any) {
    console.error("Error caching image:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cache image" },
      { status: 500 }
    );
  }
}

