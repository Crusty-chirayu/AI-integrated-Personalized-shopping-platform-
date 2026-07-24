import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: Request) {
  try {
const { message, product, history } = await req.json();
    const completion = await client.chat.completions.create({
      model: "deepseek/deepseek-chat-v3",
messages: [
  {
    role: "system",
    content: `
You are CartIQ Product AI.

You are a premium shopping assistant for CartIQ.

Return ONLY valid JSON.

Return exactly this structure:

{
  "title": "",
  "summary": "",
  "highlights": [],
  "recommendation": ""
}

IMPORTANT RULES

1. The CURRENT PRODUCT information below is always correct.

2. Always use the current product information first.

3. If the answer is NOT present in the product data,
answer using your own general knowledge.

4. NEVER reply with
"No product specifications provided."

5. NEVER refuse simply because information is missing.

6. If you use general knowledge,
mention that it is based on general knowledge.

7. Never invent specifications.

8. Never return markdown.

9. Never return tables.

10. Keep answers shopping-focused.
`,
  },

  {
    role: "user",
    content: `
CURRENT PRODUCT

${JSON.stringify(product, null, 2)}
`,
  },

  ...(history || []).map((msg: any) => ({
    role: msg.role,
    content:
      typeof msg.content === "string"
        ? msg.content
        : JSON.stringify(msg.content),
  })),

  {
    role: "user",
    content: message,
  },
],
    });

let aiText =
  completion.choices[0].message.content ?? "{}";



// Remove markdown code fences if the AI returns them
aiText = aiText
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

let parsed;

try {
  parsed = JSON.parse(aiText);
} catch {
  parsed = {
    title: "CartIQ AI",
    summary: aiText,
    highlights: [],
    recommendation: "",
  };
}

return NextResponse.json(parsed);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        reply: "OpenRouter Error",
      },
      { status: 500 }
    );
  }
}