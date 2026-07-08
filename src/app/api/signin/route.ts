import { NextResponse } from "next/server";
import { z } from "zod";

import { isPasswordCorrect } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

const signinSchema = z.object({
  id: z.string().trim().min(1, "IDは必須です"),
  password: z.string().min(1, "パスワードは必須です"),
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

  const result = signinSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { fieldErrors: result.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { id, password } = result.data;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      encrypted_password: true,
    },
  });

  if (!user) {
    return Response.json(
      { message: "IDまたはパスワードが正しくありません" },
      { status: 401 },
    );
  }

  const passwordIsCorrect = isPasswordCorrect(
    password,
    user.encrypted_password,
  );

  if (!passwordIsCorrect) {
    return Response.json(
      { message: "IDまたはパスワードが正しくありません" },
      { status: 401 },
    );
  }

  const response = NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  });
  setSessionCookie(response, user.id);

  return response;
}
