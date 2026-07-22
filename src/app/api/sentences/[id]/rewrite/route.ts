import { NextRequest } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSessionUserIdFromRequest } from "@/lib/session";

export const runtime = "nodejs";

const rewriteSchema = z.object({
  tone: z.enum(["casual", "formal"]),
});

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

function getGeminiApiKey() {
  return (
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ??
    process.env.GOOGLE_API_KEY
  );
}

function normalizeSuggestion(text: string) {
  const normalized = text
    .trim()
    .replace(/^```[a-zA-Z]*\s*/, "")
    .replace(/\s*```$/, "")
    .trim();

  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    return normalized.slice(1, -1).trim();
  }

  return normalized;
}

function buildPrompt(content: string, tone: "casual" | "formal") {
  const toneLabel = tone === "casual" ? "自然でカジュアル" : "丁寧でフォーマル";

  return [
    "You are an expert English writing editor.",
    `Rewrite the following English sentence into a ${toneLabel} version.`,
    "Keep the original meaning, fix grammar if needed, and return only one rewritten English sentence.",
    "Do not include explanations, labels, markdown, quotation marks, or Japanese.",
    "",
    `Original sentence: ${content}`,
  ].join("\n");
}

async function rewriteWithGemini(content: string, tone: "casual" | "formal") {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const model = process.env.GEMINI_MODEL ?? "gemini-flash-latest";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: buildPrompt(content, tone) }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 160,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    console.error("Gemini rewrite failed", response.status, errorText);
    throw new Error("Gemini request failed");
  }

  const data = (await response.json()) as GeminiGenerateContentResponse;
  const suggestion = normalizeSuggestion(
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("") ?? "",
  );

  if (!suggestion) {
    throw new Error("Gemini returned no suggestion");
  }

  return suggestion;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = getSessionUserIdFromRequest(request);

  if (!userId) {
    return Response.json(
      { message: "ログインしてください。" },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { message: "リクエストの形式が正しくありません。" },
      { status: 400 },
    );
  }

  const result = rewriteSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { message: "添削の種類が不正です。" },
      { status: 400 },
    );
  }

  const { id } = await params;
  const sentence = await prisma.sentence.findFirst({
    where: {
      id,
      user_id: userId,
    },
    select: {
      id: true,
      content: true,
    },
  });

  if (!sentence) {
    return Response.json(
      { message: "指定された暗唱文が見つかりません。" },
      { status: 404 },
    );
  }

  try {
    const suggestion = await rewriteWithGemini(
      sentence.content,
      result.data.tone,
    );

    return Response.json({
      suggestion,
      tone: result.data.tone,
    });
  } catch (error) {
    console.error(error);

    const isMissingKey =
      error instanceof Error && error.message === "GEMINI_API_KEY is not set";

    return Response.json(
      {
        message: isMissingKey
          ? "GEMINI_API_KEYが設定されていません。"
          : "AI添削に失敗しました。時間をおいてもう一度試してください。",
      },
      { status: isMissingKey ? 500 : 502 },
    );
  }
}
