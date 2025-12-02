import { NextRequest, NextResponse } from "next/server";
import { problems } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { number: string } }
) {
  try {
    const problemNumber = parseInt(params.number);
    if (isNaN(problemNumber)) {
      return NextResponse.json(
        { error: "Invalid problem number" },
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

    // Topics and patterns are already parsed in getByNumber
    return NextResponse.json(problem);
  } catch (error) {
    console.error("Error fetching problem:", error);
    return NextResponse.json(
      { error: "Failed to fetch problem" },
      { status: 500 }
    );
  }
}

