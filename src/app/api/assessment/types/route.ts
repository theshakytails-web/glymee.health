import { NextResponse } from "next/server";
import { db } from "@/db";
import { assessmentDefinitions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const types = await db
      .select({
        id: assessmentDefinitions.id,
        slug: assessmentDefinitions.slug,
        name: assessmentDefinitions.name,
        description: assessmentDefinitions.description,
        icon: assessmentDefinitions.icon,
        estimatedMinutes: assessmentDefinitions.estimatedMinutes,
      })
      .from(assessmentDefinitions)
      .where(eq(assessmentDefinitions.isActive, true));

    return NextResponse.json(types);
  } catch (error) {
    console.error("Failed to fetch assessment types:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessment types" },
      { status: 500 }
    );
  }
}
