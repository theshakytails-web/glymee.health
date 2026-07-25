import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Implement email service in next phase
    // - Send consultation details to admin team
    // - Send confirmation email to user
    // - Store in database

    console.log("Consultation form submitted:", body);

    return NextResponse.json(
      { message: "Consultation request received successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing consultation form:", error);
    return NextResponse.json(
      { message: "Failed to process request" },
      { status: 500 }
    );
  }
}
