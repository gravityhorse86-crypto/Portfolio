import { createHmac, timingSafeEqual } from "crypto";

import type { NextResponse } from "next/server";

export const sessionCookieName = "pf_session";
const sessionMaxAgeSeconds = 60 * 60 * 24 * 30;

function getSessionSecret() {
  const secret = process.env.AUTH_SECRET ?? process.env.DATABASE_URL;

  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is not set");
  }

  return secret ?? "dev-session-secret";
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

export function createSessionToken(userId: string) {
  const payload = {
    userId,
    expiresAt: Date.now() + sessionMaxAgeSeconds * 1000,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifySessionToken(token: string) {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as { userId?: unknown; expiresAt?: unknown };

    if (typeof payload.userId !== "string") {
      return null;
    }

    if (typeof payload.expiresAt !== "number" || payload.expiresAt < Date.now()) {
      return null;
    }

    return { userId: payload.userId };
  } catch {
    return null;
  }
}

export function setSessionCookie(response: NextResponse, userId: string) {
  response.cookies.set({
    name: sessionCookieName,
    value: createSessionToken(userId),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionMaxAgeSeconds,
  });
}
