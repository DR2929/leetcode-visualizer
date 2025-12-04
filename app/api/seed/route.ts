import { NextResponse } from "next/server";
import { problems } from "@/lib/db";

export async function POST() {
  try {
    // Check current count
    const currentCount = problems.getAll().length;
    
    if (currentCount > 0) {
      return NextResponse.json({
        success: true,
        message: `Database already has ${currentCount} problems. Skipping seed.`,
        count: currentCount,
      });
    }

    // Dynamically import and run seed
    // Use relative path to avoid build issues
    const { seedDatabase } = await import("../../../scripts/seed-leetcode");
    
    console.log("[API] Manual seed triggered via /api/seed");
    await seedDatabase();
    
    // Verify final count
    const finalCount = problems.getAll().length;
    
    return NextResponse.json({
      success: true,
      message: `Database seeded successfully!`,
      count: finalCount,
    });
  } catch (error: any) {
    console.error("[API] Seed failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to seed database",
        error: error?.stack,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const count = problems.getAll().length;
    return NextResponse.json({
      success: true,
      count,
      message: count > 0 
        ? `Database has ${count} problems` 
        : "Database is empty. Use POST /api/seed to seed.",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to check database",
      },
      { status: 500 }
    );
  }
}

