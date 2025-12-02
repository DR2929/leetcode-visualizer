import { NextRequest, NextResponse } from "next/server";
import { problems } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (query) {
      const results = problems.search(query, limit);
      return NextResponse.json(results);
    } else {
      const all = problems.getAll();
      return NextResponse.json(all);
    }
  } catch (error) {
    console.error("Error fetching problems:", error);
    return NextResponse.json(
      { error: "Failed to fetch problems" },
      { status: 500 }
    );
  }
}

