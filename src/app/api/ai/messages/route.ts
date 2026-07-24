import { NextResponse } from "next/server";

import {
  getMessages,
} from "@/lib/ai/conversation-service";

export async function GET(request: Request) {

  const { searchParams } =
    new URL(request.url);

  const conversationId =
    searchParams.get("conversationId");

  if (!conversationId) {

    return NextResponse.json(
      {
        error: "Missing conversationId",
      },
      {
        status: 400,
      }
    );

  }

  const messages =
    await getMessages(
      conversationId
    );

  return NextResponse.json(
    messages
  );

}