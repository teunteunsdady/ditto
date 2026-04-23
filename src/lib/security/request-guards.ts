import { NextResponse } from "next/server";

export function requireSameOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");
  if (!origin) {
    return null;
  }

  const requestOrigin = new URL(request.url).origin;
  if (origin !== requestOrigin) {
    return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
  }

  return null;
}

