import crypto from "crypto";
import { env } from "./env";

export function signDecrypt(signature: string): string {
  const data = Buffer.from(signature, "base64");
  const SECRET_KEY = Buffer.from(env.KEY_SIGN);

  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const encrypted = data.subarray(28);

  const decipher = crypto.createDecipheriv("aes-128-gcm", SECRET_KEY, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    "utf8"
  );
}
export function signEncrypt(text: string): string {
  const SECRET_KEY = Buffer.from(env.KEY_SIGN);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-128-gcm", SECRET_KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}
