import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, isMasterSession } from "@/lib/auth/master-session";
import { logServerError } from "@/lib/security/api-error";
import { requireSameOrigin } from "@/lib/security/request-guards";
import { createServiceClient } from "@/lib/supabase/service";

type RouteParams = {
  params: {
    id: string;
  };
};

function isAuthenticatedRequest() {
  const cookieStore = cookies();
  return isMasterSession(cookieStore.get(AUTH_COOKIE_NAME)?.value);
}

async function getCurrentAdminId() {
  const masterEmail = process.env.MASTER_LOGIN_EMAIL?.trim().toLowerCase();
  if (!masterEmail) {
    return null;
  }

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("admins")
    .select("id")
    .eq("login_email", masterEmail)
    .maybeSingle();

  return data?.id ?? null;
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  if (!isAuthenticatedRequest()) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const originError = requireSameOrigin(_request);
  if (originError) {
    return originError;
  }

  const clientId = params.id?.trim();
  if (!clientId) {
    return NextResponse.json({ message: "Invalid client id" }, { status: 400 });
  }

  try {
    const adminId = await getCurrentAdminId();
    const supabase = createServiceClient();
    const url = new URL(_request.url);
    const isPermanent = url.searchParams.get("permanent") === "true";

    const query = supabase.from("clients");
    const { error } = isPermanent
      ? await query.delete().eq("id", clientId).not("deleted_at", "is", null)
      : await query
          .update({
            deleted_at: new Date().toISOString(),
            deleted_id: adminId,
            updated_id: adminId,
          })
          .eq("id", clientId)
          .is("deleted_at", null);

    if (error) {
      logServerError("api/clients/[id].delete", error, { clientId });
      return NextResponse.json({ message: "대상자 삭제에 실패했습니다." }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    logServerError("api/clients/[id].delete.unhandled", error, { clientId });
    return NextResponse.json(
      { message: "대상자 삭제 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  if (!isAuthenticatedRequest()) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const originError = requireSameOrigin(request);
  if (originError) {
    return originError;
  }

  const clientId = params.id?.trim();
  if (!clientId) {
    return NextResponse.json({ message: "Invalid client id" }, { status: 400 });
  }

  try {
    const body = (await request.json()) as { action?: string };
    if (body.action !== "restore") {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    const adminId = await getCurrentAdminId();
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("clients")
      .update({
        deleted_at: null,
        deleted_id: null,
        updated_id: adminId,
      })
      .eq("id", clientId)
      .not("deleted_at", "is", null);

    if (error) {
      logServerError("api/clients/[id].patch", error, { clientId });
      return NextResponse.json({ message: "대상자 복원에 실패했습니다." }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    logServerError("api/clients/[id].patch.unhandled", error, { clientId });
    return NextResponse.json(
      { message: "대상자 복원 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
