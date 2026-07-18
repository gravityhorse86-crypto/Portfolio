import { z } from "zod";
import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionUserIdFromRequest } from "@/lib/session";

export const runtime = "nodejs";

const updateStatusSchema = z.object({
  status_id: z.enum(["0", "1", "2"]).optional(),
  content: z
    .string()
    .trim()
    .min(1, "英文を入力してください")
    .refine((value) => value.trim().split(/\s+/).length <= 100, {
      message: "英文は100語以内で入力してください",
    })
    .optional(),
  translation: z
    .string()
    .trim()
    .min(1, "日本語訳を入力してください")
    .max(200, "日本語訳は200文字以内で入力してください")
    .optional(),
}).superRefine((value, context) => {
  if (value.status_id || value.content || value.translation) return;

  context.addIssue({
    code: "custom",
    message: "更新する内容を入力してください。",
  });
});

export async function PATCH(
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

  const result = updateStatusSchema.safeParse(body);

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
    const data = {
      ...(result.data.status_id
        ? {
            status_id: result.data.status_id,
            statusUpdated_at: new Date(),
          }
        : {}),
      ...(result.data.content ? { content: result.data.content } : {}),
      ...(result.data.translation
        ? { translation: result.data.translation }
        : {}),
    };

    const updated = await prisma.sentence.updateMany({
      where: {
        id,
        user_id: userId,
      },
      data,
    });

    if (updated.count === 0) {
      return Response.json(
        { message: "指定された暗唱文が見つかりません。" },
        { status: 404 },
      );
    }

    const sentence = await prisma.sentence.findFirst({
      where: {
        id,
        user_id: userId,
      },
      select: {
        id: true,
        content: true,
        translation: true,
        status_id: true,
        statusUpdated_at: true,
      },
    });

    return Response.json(sentence);
  } catch (error) {
    console.error(error);

    return Response.json(
      { message: "ステータスの更新に失敗しました。" },
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
    return Response.json(
      { message: "ログインしてください。" },
      { status: 401 },
    );
  }

  const { id } = await params;

  try {
    const deleted = await prisma.sentence.deleteMany({
      where: {
        id,
        user_id: userId,
      },
    });

    if (deleted.count === 0) {
      return Response.json(
        { message: "指定された暗唱文が見つかりません。" },
        { status: 404 },
      );
    }

    return Response.json({ deleted: true });
  } catch (error) {
    console.error(error);

    return Response.json(
      { message: "削除に失敗しました。" },
      { status: 500 },
    );
  }
}
