import { NextResponse } from "next/server";
import { db } from "@/db";
import { assessmentUploads, assessmentSubmissions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { uploadPdf } from "@/lib/gcs";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const submissionId = formData.get("submissionId") as string | null;
    const fileType = formData.get("fileType") as string | null;

    if (!file || !submissionId || !fileType) {
      return NextResponse.json(
        { error: "File, submissionId, and fileType are required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed. Please upload JPEG, PNG, WebP, or PDF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    const [submission] = await db
      .select()
      .from(assessmentSubmissions)
      .where(eq(assessmentSubmissions.id, submissionId))
      .limit(1);

    if (!submission) {
      return NextResponse.json(
        { error: "Assessment submission not found" },
        { status: 404 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `assessments/${submissionId}/${Date.now()}-${file.name}`;

    const filePath = await uploadPdf(fileName, buffer);

    if (!filePath) {
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    const uploadId = crypto.randomUUID();
    await db.insert(assessmentUploads).values({
      id: uploadId,
      submissionId,
      fileName: file.name,
      filePath: fileName,
      fileType,
      fileSize: file.size,
      createdAt: new Date(),
    });

    return NextResponse.json({
      id: uploadId,
      fileName: file.name,
      fileType,
    });
  } catch (error) {
    console.error("Failed to upload file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
