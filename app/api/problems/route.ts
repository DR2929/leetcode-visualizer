import { NextRequest, NextResponse } from "next/server";
import { problems } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "20");

    console.log(`[API] Fetching problems - query: "${query}", limit: ${limit}`);

    if (query) {
      const results = problems.search(query, limit);
      console.log(`[API] Found ${results.length} problems matching "${query}"`);
      return NextResponse.json(results);
    } else {
      const all = problems.getAll();
      console.log(`[API] Returning all ${all.length} problems`);
      return NextResponse.json(all);
    }
  } catch (error: any) {
    console.error("[API] Error fetching problems:", error);
    console.error("[API] Error stack:", error?.stack);
    return NextResponse.json(
      { 
        error: "Failed to fetch problems",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}

