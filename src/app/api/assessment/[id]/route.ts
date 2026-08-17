import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  assessmentSubmissions,
  assessmentResponses,
  assessmentUploads,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [submission] = await db
      .select()
      .from(assessmentSubmissions)
      .where(eq(assessmentSubmissions.id, id))
      .limit(1);

    if (!submission) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    const responses = await db
      .select()
      .from(assessmentResponses)
      .where(eq(assessmentResponses.submissionId, id));

    const uploads = await db
      .select()
      .from(assessmentUploads)
      .where(eq(assessmentUploads.submissionId, id));

    return NextResponse.json({
      submission,
      responses,
      uploads,
    });
  } catch (error) {
    console.error("Failed to fetch assessment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessment" },
      { status: 500 }
    );
  }
}
