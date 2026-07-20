import { NextRequest } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { isPrismaErrorCode } from "@/lib/prisma-error";
import { getSessionUserIdFromRequest } from "@/lib/session";

export const runtime = "nodejs";

const renameSetSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "セット名を入力してください")
    .max(30, "セット名は30文字以内で入力してください"),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = getSessionUserIdFromRequest(request);

  if (!userId) {
    return Response.json({ message: "ログインしてください。" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { message: "リクエストの形式が正しくありません。" },
      { status: 400 },
    );
  }

  const result = renameSetSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      {
        message: "入力内容を確認してください。",
        fieldErrors: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const existingSet = await prisma.flashcardSet.findFirst({
    where: { id, user_id: userId },
    select: { id: true },
  });

  if (!existingSet) {
    return Response.json(
      { message: "指定されたセットが見つかりません。" },
      { status: 404 },
    );
  }

  try {
    const set = await prisma.flashcardSet.update({
      where: { id },
      data: { name: result.data.name },
      select: {
        id: true,
        name: true,
        _count: { select: { sentences: true } },
      },
    });

    return Response.json({
      set: {
        id: set.id,
        name: set.name,
        sentenceCount: set._count.sentences,
      },
    });
  } catch (error) {
    if (isPrismaErrorCode(error, "P2002")) {
      return Response.json(
        { fieldErrors: { name: ["同じ名前のセットがすでにあります"] } },
        { status: 409 },
      );
    }

    console.error(error);

    return Response.json(
      { message: "セット名の変更に失敗しました。" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = getSessionUserIdFromRequest(request);

  if (!userId) {
    return Response.json({ message: "ログインしてください。" }, { status: 401 });
  }

  const { id } = await params;

  const existingSet = await prisma.flashcardSet.findFirst({
    where: { id, user_id: userId },
    select: { id: true },
  });

  if (!existingSet) {
    return Response.json(
      { message: "指定されたセットが見つかりません。" },
      { status: 404 },
    );
  }

  try {
    // セットに紐づく文章は onDelete: SetNull のため自動削除されない。
    // 要件どおり、文章もまとめて削除してからセットを削除する。
    await prisma.$transaction([
      prisma.sentence.deleteMany({
        where: { flashcard_set_id: id, user_id: userId },
      }),
      prisma.flashcardSet.delete({ where: { id } }),
    ]);

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);

    return Response.json(
      { message: "セットの削除に失敗しました。" },
      { status: 500 },
    );
  }
}
