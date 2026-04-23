import { NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createMasterSessionToken,
} from "@/lib/auth/master-session";
import {
  clearLoginFailures,
  getLoginLockStatus,
  registerLoginFailure,
} from "@/lib/security/login-protection";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { requireSameOrigin } from "@/lib/security/request-guards";
import { sendSecurityAlert } from "@/lib/security/security-alert";
import { isTurnstileEnabled, verifyTurnstileToken } from "@/lib/security/turnstile";

type LoginBody = {
  email?: string;
  password?: string;
  turnstileToken?: string;
};

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) {
    void sendSecurityAlert({
      event: "login.origin_blocked",
      level: "warn",
      detail: {
        origin: request.headers.get("origin"),
      },
    });
    return originError;
  }

  const limit = checkRateLimit(request, "auth-login", 8, 10 * 60 * 1000);
  if (!limit.ok) {
    void sendSecurityAlert({
      event: "login.rate_limited",
      level: "warn",
    });
    return NextResponse.json(
      { message: "Too many login attempts. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfterSeconds),
        },
      },
    );
  }

  const masterEmail = process.env.MASTER_LOGIN_EMAIL?.trim().toLowerCase();
  const masterPassword = process.env.MASTER_LOGIN_PASSWORD;

  if (!masterEmail || !masterPassword) {
    void sendSecurityAlert({
      event: "login.server_misconfigured",
      level: "error",
    });
    return NextResponse.json(
      { message: "Master credentials are not configured" },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => null)) as LoginBody | null;
  if (!body) {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const turnstileToken = body.turnstileToken?.trim() ?? "";

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
  }

  const lockStatus = getLoginLockStatus(request, email);
  if (lockStatus.locked) {
    void sendSecurityAlert({
      event: "login.locked_attempt",
      level: "warn",
      detail: {
        email,
        failCount: lockStatus.failCount ?? null,
      },
    });
    return NextResponse.json(
      { message: "Too many failed attempts. Please try again later." },
      {
        status: 423,
        headers: {
          "Retry-After": String(lockStatus.retryAfterSeconds),
        },
      },
    );
  }

  if (isTurnstileEnabled()) {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const remoteIp = forwardedFor?.split(",")[0]?.trim();
    const verified = await verifyTurnstileToken(turnstileToken, remoteIp);
    if (!verified) {
      void sendSecurityAlert({
        event: "login.captcha_failed",
        level: "warn",
        detail: { email },
      });
      return NextResponse.json(
        { message: "Captcha verification failed" },
        { status: 400 },
      );
    }
  }

  if (email !== masterEmail || password !== masterPassword) {
    const failure = registerLoginFailure(request, email);
    void sendSecurityAlert({
      event: failure.locked ? "login.locked" : "login.failed",
      level: "warn",
      detail: {
        email,
        failCount: failure.failCount,
      },
    });

    if (failure.locked) {
      return NextResponse.json(
        { message: "Too many failed attempts. Please try again later." },
        {
          status: 423,
          headers: {
            "Retry-After": String(failure.retryAfterSeconds ?? 0),
          },
        },
      );
    }

    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 },
    );
  }

  clearLoginFailures(request, email);
  void sendSecurityAlert({
    event: "login.success",
    level: "info",
    detail: { email },
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: createMasterSessionToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return response;
}
