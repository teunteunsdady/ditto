import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createMasterSessionToken,
  verifyMasterSession,
} from "@/lib/auth/master-session";

export async function GET() {
  const cookieStore = cookies();
  const session = verifyMasterSession(cookieStore.get(AUTH_COOKIE_NAME)?.value);
  const response = NextResponse.json({ authenticated: session.valid });

  // 활동 중에는 세션 만료 시간을 갱신(rolling session)
  if (session.valid) {
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: createMasterSessionToken(),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
  }

  return response;
}
