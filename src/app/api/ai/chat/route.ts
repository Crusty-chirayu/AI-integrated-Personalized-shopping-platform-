import { NextRequest, NextResponse } from "next/server";
import { processUserMessage } from "@/lib/ai/orchestrator";

export async function POST(req: NextRequest) {
  try {
    const {
      sessionId,
      message,
    } = await req.json();

    if (!sessionId || !message) {
      return NextResponse.json(
        {
          error: "sessionId and message are required.",
        },
        {
          status: 400,
        }
      );
    }

    const response = await processUserMessage(
      sessionId,
      message
    );

    return NextResponse.json(response);

  } catch (error) {

    console.error("AI Chat API Error:", error);

    return NextResponse.json(
      {
        error: "Internal server error.",
      },
      {
        status: 500,
      }
    );

  }
}   