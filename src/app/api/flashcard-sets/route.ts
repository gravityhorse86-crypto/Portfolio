import { NextRequest } from "next/server";
import { z } from "zod";

import { ensureDefaultFlashcardSet } from "@/lib/flashcard-sets";
import { prisma } from "@/lib/prisma";
import { isPrismaErrorCode } from "@/lib/prisma-error";
import { getSessionUserIdFromRequest } from "@/lib/session";

export const runtime = "nodejs";

const createSetSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "セット名を入力してください")
    .max(30, "セット名は30文字以内で入力してください"),
});

export async function GET(request: NextRequest) {
  const userId = getSessionUserIdFromRequest(request);

  if (!userId) {
    return Response.json(
      { message: "ログインしてください。" },
      { status: 401 },
    );
  }

  await ensureDefaultFlashcardSet(userId);

  const sets = await prisma.flashcardSet.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "asc" },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          sentences: true,
        },
      },
    },
  });

  return Response.json({
    sets: sets.map((set) => ({
      id: set.id,
      name: set.name,
      sentenceCount: set._count.sentences,
    })),
  });
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

  const result = createSetSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      {
        message: "入力内容を確認してください。",
        fieldErrors: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const set = await prisma.flashcardSet.create({
      data: {
        name: result.data.name,
        user_id: userId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return Response.json({ set: { ...set, sentenceCount: 0 } }, { status: 201 });
  } catch (error) {
    if (isPrismaErrorCode(error, "P2002")) {
      return Response.json(
        { fieldErrors: { name: ["同じ名前のセットがすでにあります"] } },
        { status: 409 },
      );
    }

    console.error(error);

    return Response.json(
      { message: "セットの作成に失敗しました。" },
      { status: 500 },
    );
  }
}
