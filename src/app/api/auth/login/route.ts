import { NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createMasterSessionToken,
} from "@/lib/auth/master-session";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const masterEmail = process.env.MASTER_LOGIN_EMAIL?.trim().toLowerCase();
  const masterPassword = process.env.MASTER_LOGIN_PASSWORD;

  if (!masterEmail || !masterPassword) {
    return NextResponse.json(
      { message: "Master credentials are not configured" },
      { status: 500 },
    );
  }

  const body = (await request.json()) as LoginBody;
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (email !== masterEmail || password !== masterPassword) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 },
    );
  }

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
