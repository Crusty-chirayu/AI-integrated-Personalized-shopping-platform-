import { NextResponse } from "next/server";

import {
  getConversations,
} from "@/lib/ai/conversation-service";

export async function GET(request: Request) {

  const { searchParams } =
    new URL(request.url);

  const userId =
    searchParams.get("userId");

  if (!userId) {

    return NextResponse.json(
      {
        error: "Missing userId",
      },
      {
        status: 400,
      }
    );

  }

  const conversations =
    await getConversations(userId);

  return NextResponse.json(
    conversations
  );

}