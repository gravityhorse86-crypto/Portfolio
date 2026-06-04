import { z } from "zod";

import { isPasswordCorrect } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const signinSchema = z.object({
  id: z.string().min(1, "IDは必須です"),
  password: z.string().min(1, "パスワードは必須です"),
});

export async function POST(request: Request) {
  const body = await request.json();
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

  return Response.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  });
}
