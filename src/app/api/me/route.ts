import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createPasswordHash, isPasswordCorrect } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { isPrismaErrorCode } from "@/lib/prisma-error";
import { sessionCookieName, verifySessionToken } from "@/lib/session";

export const runtime = "nodejs";

const updateMyInfoSchema = z
  .object({
    username: z.string().trim().min(1, "ユーザー名は必須です"),
    email: z.string().trim().email("メールアドレスの形式が正しくありません"),
    currentPassword: z.string().optional().default(""),
    newPassword: z.string().optional().default(""),
  })
  .superRefine((value, context) => {
    if (!value.newPassword) return;

    if (value.newPassword.length < 8) {
      context.addIssue({
        code: "custom",
        path: ["newPassword"],
        message: "新しいパスワードは8文字以上で入力してください",
      });
    }

    if (!value.currentPassword) {
      context.addIssue({
        code: "custom",
        path: ["currentPassword"],
        message: "パスワードを変更するには現在のパスワードを入力してください",
      });
    }
  });

function getSessionUserId(request: NextRequest) {
  const token = request.cookies.get(sessionCookieName)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token)?.userId ?? null;
}

export async function GET(request: NextRequest) {
  const userId = getSessionUserId(request);

  if (!userId) {
    return NextResponse.json(
      { message: "ログインしてください。" },
      { status: 401 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { message: "ユーザーが見つかりません。" },
      { status: 404 },
    );
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: NextRequest) {
  const userId = getSessionUserId(request);

  if (!userId) {
    return NextResponse.json(
      { message: "ログインしてください。" },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "リクエストの形式が正しくありません。" },
      { status: 400 },
    );
  }

  const result = updateMyInfoSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { fieldErrors: result.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      encrypted_password: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { message: "ユーザーが見つかりません。" },
      { status: 404 },
    );
  }

  const { username, email, currentPassword, newPassword } = result.data;

  if (newPassword && !isPasswordCorrect(currentPassword, user.encrypted_password)) {
    return NextResponse.json(
      {
        fieldErrors: {
          currentPassword: ["現在のパスワードが正しくありません"],
        },
      },
      { status: 400 },
    );
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username,
        email,
        ...(newPassword
          ? { encrypted_password: createPasswordHash(newPassword) }
          : {}),
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    if (isPrismaErrorCode(error, "P2002")) {
      return NextResponse.json(
        {
          fieldErrors: {
            email: ["このメールアドレスはすでに使われています"],
          },
        },
        { status: 409 },
      );
    }

    console.error(error);

    return NextResponse.json(
      { message: "ユーザー情報の更新に失敗しました。" },
      { status: 500 },
    );
  }
}
