import { NextResponse } from "next/server";

import { processUserMessage }
from "@/lib/ai/orchestrator";

export async function POST(req: Request) {

  try {

const {
  sessionId,
  message,
} = await req.json();

const response =
await processUserMessage(
  sessionId,
  message
);

    return NextResponse.json(response);

  } catch (err) {

    console.error(err);

    return NextResponse.json(

      {
        error:
          "CartIQ AI failed.",
      },

      {
        status: 500,
      }

    );

  }

}