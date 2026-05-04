import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const PREFIX = "enc:v1";

function getEncryptionKey() {
  const raw = process.env.CLIENT_PHONE_ENCRYPTION_KEY?.trim();
  if (!raw) {
    throw new Error("CLIENT_PHONE_ENCRYPTION_KEY is not configured.");
  }

  let key: Buffer;
  try {
    key = Buffer.from(raw, "base64");
  } catch {
    throw new Error("CLIENT_PHONE_ENCRYPTION_KEY must be valid base64.");
  }

  if (key.length !== 32) {
    throw new Error("CLIENT_PHONE_ENCRYPTION_KEY must decode to 32 bytes.");
  }

  return key;
}

export function encryptPhone(value: string) {
  const iv = randomBytes(12);
  const key = getEncryptionKey();
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${PREFIX}:${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decryptPhone(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (!trimmed.startsWith(`${PREFIX}:`)) {
    // 레거시 평문 데이터 호환
    return trimmed;
  }

  const parts = trimmed.split(":");
  if (parts.length !== 5) {
    // 이전 운영 데이터의 임시값/비표준값은 앱 레벨에서 안전하게 무시
    return "";
  }

  const [, version, ivBase64, authTagBase64, encryptedBase64] = parts;
  if (!version || !ivBase64 || !authTagBase64 || !encryptedBase64) {
    throw new Error("Invalid encrypted phone payload.");
  }

  const key = getEncryptionKey();
  const iv = Buffer.from(ivBase64, "base64");
  const authTag = Buffer.from(authTagBase64, "base64");
  const encrypted = Buffer.from(encryptedBase64, "base64");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return decrypted.toString("utf8");
}
