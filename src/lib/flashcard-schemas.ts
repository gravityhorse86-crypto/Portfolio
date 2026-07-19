import { z } from "zod";

export const sentenceSchema = z.object({
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

export const setSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "セット名を入力してください")
    .max(30, "セット名は30文字以内で入力してください"),
});
