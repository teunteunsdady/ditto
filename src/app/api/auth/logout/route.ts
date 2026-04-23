import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/master-session";
import { requireSameOrigin } from "@/lib/security/request-guards";

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) {
    return originError;
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
