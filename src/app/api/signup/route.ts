import { NextResponse } from "next/server";
import { z } from "zod";

import { createPasswordHash } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { isPrismaErrorCode } from "@/lib/prisma-error";
import { setSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

const signupSchema = z.object({
  id: z
    .string()
    .trim()
    .min(8, "IDは8文字以上で入力してください")
    .regex(/^[a-zA-Z0-9]+$/, "IDは英数字だけで入力してください")
    .regex(/[a-zA-Z]/, "IDには英字を含めてください")
    .regex(/[0-9]/, "IDには数字を含めてください"),
  username: z
    .string()
    .trim()
    .min(1, "ユーザー名は必須です")
    .max(15, "ユーザー名は15文字以内で入力してください"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("メールアドレスの形式が正しくありません"),
  password: z.string().min(8, "パスワードは8文字以上でなければなりません"),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { message: "リクエストの形式が正しくありません。" },
      { status: 400 },
    );
  }

  const result = signupSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { fieldErrors: result.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { id, username, email, password } = result.data;

  try {
    if (!process.env.DATABASE_URL) {
      return Response.json(
        { message: "サーバーのデータベース接続設定が不足しています。" },
        { status: 500 },
      );
    }

    const existingIdUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (existingIdUser) {
      return Response.json(
        { message: "このIDはすでに使われています" },
        { status: 409 },
      );
    }

    const existingEmailUser = await prisma.user.findFirst({
      where: { email },
      select: { id: true },
    });

    if (existingEmailUser) {
      return Response.json(
        { message: "このメールアドレスはすでに使われています" },
        { status: 409 },
      );
    }

    const user = await prisma.user.create({
      data: {
        id,
        username,
        email,
        encrypted_password: createPasswordHash(password),
      },
      select: {
        id: true,
        username: true,
        email: true,
        created_at: true,
      },
    });

    const response = NextResponse.json({ user }, { status: 201 });
    setSessionCookie(response, user.id);

    return response;
  } catch (error) {
    if (isPrismaErrorCode(error, "P2002")) {
      return Response.json(
        { message: "このIDまたはメールアドレスはすでに使われています" },
        { status: 409 },
      );
    }

    console.error(error);

    return Response.json(
      { message: "登録に失敗しました。時間をおいてもう一度お試しください。" },
      { status: 500 },
    );
  }
}
