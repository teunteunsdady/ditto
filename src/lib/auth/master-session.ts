import { createHmac, timingSafeEqual } from "node:crypto";

export const AUTH_COOKIE_NAME = "master_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8시간

type SessionPayload = {
  exp: number;
};

function getSessionSecret() {
  const sessionSecret = process.env.MASTER_SESSION_SECRET;
  if (sessionSecret) return sessionSecret;

  // Local/dev 환경에서는 기존 동작을 유지하되, 운영 환경에서는 별도 시크릿을 강제합니다.
  if (process.env.NODE_ENV !== "production") {
    return process.env.MASTER_LOGIN_PASSWORD ?? "";
  }

  return "";
}

function isSignatureMatch(expected: string, actual: string) {
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}

function signPayload(payloadBase64: string) {
  const secret = getSessionSecret();
  if (!secret) return "";
  return createHmac("sha256", secret)
    .update(payloadBase64)
    .digest("base64url");
}

function decodePayload(value: string): SessionPayload | null {
  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8");
    const payload = JSON.parse(decoded) as SessionPayload;
    if (!payload || typeof payload.exp !== "number") {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function createMasterSessionToken(nowMs = Date.now()) {
  const payload: SessionPayload = {
    exp: nowMs + SESSION_MAX_AGE_SECONDS * 1000,
  };
  const payloadBase64 = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  const signature = signPayload(payloadBase64);
  return `${payloadBase64}.${signature}`;
}

export function verifyMasterSession(
  value: string | undefined,
  nowMs = Date.now(),
) {
  if (!value || !value.includes(".")) {
    return { valid: false };
  }

  const [payloadBase64, signature] = value.split(".");
  if (!payloadBase64 || !signature) {
    return { valid: false };
  }

  const expectedSignature = signPayload(payloadBase64);
  if (!expectedSignature || !isSignatureMatch(expectedSignature, signature)) {
    return { valid: false };
  }

  const payload = decodePayload(payloadBase64);
  if (!payload) {
    return { valid: false };
  }

  if (payload.exp <= nowMs) {
    return { valid: false };
  }

  return { valid: true, payload };
}

export function isMasterSession(value: string | undefined) {
  return verifyMasterSession(value).valid;
}
