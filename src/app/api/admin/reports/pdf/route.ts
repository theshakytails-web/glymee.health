import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { downloadPdf } from "@/lib/gcs";

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return new NextResponse(null, { status: 401 });
  }

  const path = request.nextUrl.searchParams.get("path");
  if (!path) {
    return NextResponse.json({ error: "path is required" }, { status: 400 });
  }

  const normalized = path.replace(/\\/g, "/");
  if (
    !normalized.startsWith("reports/") ||
    !normalized.endsWith(".pdf") ||
    normalized.includes("..")
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const buffer = await downloadPdf(normalized);
  if (!buffer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const fileName = normalized.split("/").pop();
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${fileName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
