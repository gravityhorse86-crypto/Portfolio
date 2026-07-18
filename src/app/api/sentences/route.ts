import { z } from "zod";
import { NextRequest } from "next/server";

import { ensureDefaultFlashcardSet } from "@/lib/flashcard-sets";
import { getSessionUserIdFromRequest } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const sentenceSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "英文を入力してください")
    .refine((value) => value.trim().split(/\s+/).length <= 100, {
      message: "英文は100語以内で入力してください",
    }),
  translation: z
    .string()
    .trim()
    .min(1, "日本語訳を入力してください")
    .max(200, "日本語訳は200文字以内で入力してください"),
});

const requestSchema = z.object({
  setId: z.string().uuid().optional(),
  sentences: z.array(sentenceSchema).min(1),
});

async function ensureSentenceStatuses() {
  await prisma.sentenceStatus.createMany({
    data: [
      { id: "0", name: "覚えた" },
      { id: "1", name: "怪しい" },
      { id: "2", name: "覚えてない" },
    ],
    skipDuplicates: true,
  });
}

export async function GET(request: NextRequest) {
  const userId = getSessionUserIdFromRequest(request);

  if (!userId) {
    return Response.json(
      { message: "ログインしてください。" },
      { status: 401 },
    );
  }

  const setId = request.nextUrl.searchParams.get("setId");

  if (setId) {
    const set = await prisma.flashcardSet.findFirst({
      where: {
        id: setId,
        user_id: userId,
      },
      select: {
        id: true,
      },
    });

    if (!set) {
      return Response.json(
        { message: "指定されたセットが見つかりません。" },
        { status: 404 },
      );
    }
  }

  const sentences = await prisma.sentence.findMany({
    where: {
      user_id: userId,
      ...(setId ? { flashcard_set_id: setId } : {}),
    },
    orderBy: {
      created_at: "desc",
    },
    select: {
      id: true,
      content: true,
      translation: true,
      status_id: true,
      created_at: true,
    },
  });

  return Response.json({ sentences });
}

export async function POST(request: NextRequest) {
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

  const result = requestSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      {
        message: "入力内容を確認してください。",
        fieldErrors: result.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    await ensureSentenceStatuses();

    const targetSet = result.data.setId
      ? await prisma.flashcardSet.findFirst({
          where: {
            id: result.data.setId,
            user_id: userId,
          },
          select: {
            id: true,
          },
        })
      : await ensureDefaultFlashcardSet(userId);

    if (!targetSet) {
      return Response.json(
        { message: "保存先のセットが見つかりません。" },
        { status: 404 },
      );
    }

    const sentences = await prisma.sentence.createMany({
      data: result.data.sentences.map((sentence) => ({
        content: sentence.content,
        translation: sentence.translation,
        status_id: "2",
        user_id: userId,
        flashcard_set_id: targetSet.id,
      })),
    });

    return Response.json({ count: sentences.count }, { status: 201 });
  } catch (error) {
    console.error(error);

    return Response.json(
      { message: "保存に失敗しました。時間をおいてもう一度試してください。" },
      { status: 500 },
    );
  }
}
