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

type AccessLogBody = {
  viewerName?: string;
  reason?: string;
  action?: "name_unmask" | "details_view";
  viewedFields?: string[];
};

function isAuthenticatedRequest() {
  const cookieStore = cookies();
  return isMasterSession(cookieStore.get(AUTH_COOKIE_NAME)?.value);
}

async function getCurrentAdmin() {
  const masterEmail = process.env.MASTER_LOGIN_EMAIL?.trim().toLowerCase();
  if (!masterEmail) {
    return { id: null, email: null };
  }

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("admins")
    .select("id, login_email")
    .eq("login_email", masterEmail)
    .maybeSingle();

  return {
    id: data?.id ?? null,
    email: data?.login_email ?? masterEmail,
  };
}

export async function POST(request: Request, { params }: RouteParams) {
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
    const body = (await request.json()) as AccessLogBody;
    const viewerName = body.viewerName?.trim();
    const reason = body.reason?.trim();
    const action = body.action;
    const viewedFields = Array.isArray(body.viewedFields)
      ? body.viewedFields
          .map((field) => String(field).trim())
          .filter(Boolean)
          .slice(0, 20)
      : [];

    if (!viewerName || viewerName.length < 2) {
      return NextResponse.json(
        { message: "열람자 이름은 2자 이상 입력해주세요." },
        { status: 400 },
      );
    }

    if (!reason || reason.length < 3) {
      return NextResponse.json(
        { message: "열람 사유는 3자 이상 입력해주세요." },
        { status: 400 },
      );
    }

    if (action !== "name_unmask" && action !== "details_view") {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    const { id: adminId, email: adminEmail } = await getCurrentAdmin();
    const supabase = createServiceClient();

    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id")
      .eq("id", clientId)
      .maybeSingle();

    if (clientError || !client) {
      logServerError("api/clients/[id]/access-logs.client_lookup", clientError, { clientId });
      return NextResponse.json({ message: "대상자를 찾을 수 없습니다." }, { status: 404 });
    }

    const viewedBy = adminEmail ? `${viewerName} (${adminEmail})` : viewerName;
    const { data: inserted, error } = await supabase
      .from("client_access_logs")
      .insert({
        client_id: clientId,
        admin_id: adminId,
        admin_email: viewedBy,
        access_action: action,
        access_reason: reason,
        viewed_fields: viewedFields,
      })
      .select("id, admin_email, access_reason, created_at")
      .single();

    if (error) {
      logServerError("api/clients/[id]/access-logs.post", error, { clientId, action });
      return NextResponse.json({ message: "접근 로그 저장에 실패했습니다." }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      log: {
        id: inserted.id,
        viewedBy: inserted.admin_email ?? "unknown",
        reason: inserted.access_reason,
        viewedAt: inserted.created_at,
      },
    });
  } catch (error) {
    logServerError("api/clients/[id]/access-logs.post.unhandled", error, { clientId });
    return NextResponse.json(
      { message: "접근 로그 저장 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
