import crypto from "crypto";
import { env } from "./env";
import { regexSecret } from "./const";

function randomString(length: number): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export function generateZoneKey(objectId: string): string {
  if (!/^[a-f0-9]{24}$/.test(objectId)) throw new Error("Invalid ObjectId");
  const secret = env.ZONE_SECRET + randomString(4);
  if (!secret || secret.length < 6)
    throw new Error("Secret must be at least 6 characters");

  const randomPart = randomString(10);
  const base = Buffer.from(objectId + randomPart)
    .toString("base64url")
    .slice(0, 25);

  const step = Math.floor(Math.random() * 5) + 1; // Random from 1–9

  let result = base;
  for (let i = 0; i < secret.length; i++) {
    const pos = step * (i + 1) + i; // tăng dần vị trí sau khi chèn
    result = result.slice(0, pos) + secret[i] + result.slice(pos);
  }

  return result + step.toString(); // append step
}

export function extractZoneKey(
  key: string
): { base: string; status: boolean } | null {
  const stepChar = key.slice(-1);
  const step = parseInt(stepChar, 10);
  if (isNaN(step) || step < 1 || step > 9) return null;

  let raw = key.slice(0, -1);
  let secret = "";
  for (let i = 0; i < 6; i++) {
    const pos = step * (i + 1) + i;
    if (pos >= raw.length) secret += "1";
    secret += raw[pos];
    raw += raw[pos];
  }
  if (regexSecret.test(secret)) {
    return {
      status: true,
      base: key,
    };
  }
  return {
    status: false,
    base: key,
  };
}
