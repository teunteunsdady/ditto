import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAME,
  isMasterSession,
} from "@/lib/auth/master-session";

export async function GET() {
  const cookieStore = cookies();
  const authenticated = isMasterSession(
    cookieStore.get(AUTH_COOKIE_NAME)?.value,
  );

  return NextResponse.json({ authenticated });
}
