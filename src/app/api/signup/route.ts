import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { createPasswordHash } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

const signupSchema = z.object({
  id: z
    .string()
    .min(1, "IDは必須です")
    .regex(/^[a-zA-Z0-9_]+$/, "IDは英数字と_だけで入力してください"),
  username: z.string().min(1, "ユーザー名は必須です"),
  email: z.string().email("メールアドレスの形式が正しくありません"),
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
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
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
