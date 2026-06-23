import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const updateStatusSchema = z.object({
  status_id: z.enum(["0", "1", "2"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
      { message: "ステータスの値が不正です。" },
      { status: 400 },
    );
  }

  try {
    const sentence = await prisma.sentence.update({
      where: { id },
      data: {
        status_id: result.data.status_id,
        statusUpdated_at: new Date(),
      },
      select: {
        id: true,
        status_id: true,
        statusUpdated_at: true,
      },
    });

    return Response.json(sentence);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json(
        { message: "指定された暗唱文が見つかりません。" },
        { status: 404 },
      );
    }

    console.error(error);

    return Response.json(
      { message: "ステータスの更新に失敗しました。" },
      { status: 500 },
    );
  }
}
