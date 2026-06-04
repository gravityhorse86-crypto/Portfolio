import { randomBytes, scryptSync } from "crypto";

const keyLength = 64;

export function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const passwordHash = scryptSync(password, salt, keyLength).toString("hex");

  return `${salt}:${passwordHash}`;
}

export function isPasswordCorrect(password: string, savedPassword: string) {
  const [salt, savedPasswordHash] = savedPassword.split(":");

  if (!salt || !savedPasswordHash) {
    return false;
  }

  const inputPasswordHash = scryptSync(password, salt, keyLength).toString(
    "hex",
  );

  return inputPasswordHash === savedPasswordHash;
}
