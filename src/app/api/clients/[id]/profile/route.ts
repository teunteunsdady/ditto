import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, isMasterSession } from "@/lib/auth/master-session";
import { decryptPhone } from "@/lib/security/field-encryption";
import { logServerError } from "@/lib/security/api-error";
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

export async function GET(_request: Request, { params }: RouteParams) {
  if (!isAuthenticatedRequest()) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const clientId = params.id?.trim();
  if (!clientId) {
    return NextResponse.json({ message: "Invalid client id" }, { status: 400 });
  }

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("clients")
      .select(
        "id, name, birth_date, phone, stress_factor, location, privacy_consent, privacy_consented_at, created_at",
      )
      .eq("id", clientId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error || !data) {
      logServerError("api/clients/[id]/profile.get", error, { clientId });
      return NextResponse.json({ message: "대상자를 찾을 수 없습니다." }, { status: 404 });
    }

    let phone = "";
    try {
      phone = decryptPhone(String(data.phone ?? ""));
    } catch (decryptError) {
      logServerError("api/clients/[id]/profile.decrypt_phone", decryptError, { clientId });
      phone = "복호화 실패";
    }

    return NextResponse.json({
      item: {
        id: data.id,
        name: data.name,
        birthDate: data.birth_date,
        phone,
        stressFactor: data.stress_factor,
        location: data.location,
        privacyConsent: data.privacy_consent,
        privacyConsentedAt: data.privacy_consented_at,
        createdAt: data.created_at,
      },
    });
  } catch (error) {
    logServerError("api/clients/[id]/profile.get.unhandled", error, { clientId });
    return NextResponse.json(
      { message: "대상자 개인정보 조회 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
