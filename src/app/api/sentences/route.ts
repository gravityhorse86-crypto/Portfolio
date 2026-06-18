import { z } from "zod";
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
  sentences: z.array(sentenceSchema).min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const result = requestSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { fieldErrors: result.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const sentences = await prisma.sentence.createMany({
      data: result.data.sentences.map((sentence) => ({
        content: sentence.content,
        translation: sentence.translation,
        status_id: "2",
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
