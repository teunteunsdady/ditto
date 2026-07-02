import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, isMasterSession } from "@/lib/auth/master-session";
import { isValidKoreanMobilePhone, normalizeKoreanMobilePhone } from "@/lib/phone";
import { encryptPhone } from "@/lib/security/field-encryption";
import { logServerError } from "@/lib/security/api-error";
import { requireSameOrigin } from "@/lib/security/request-guards";
import { createServiceClient } from "@/lib/supabase/service";

type CreateClientBody = {
  name?: string;
  birthDate?: string;
  phone?: string;
  stressFactor?: string;
  location?: string;
  privacyConsent?: boolean;
};

const CLIENT_LIST_MAX_RETRIES = 3;

function isRetryableNetworkIssue(error: unknown) {
  const text = (() => {
    if (!error) return "";
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  })().toLowerCase();

  return (
    text.includes("fetch failed") ||
    text.includes("enotfound") ||
    text.includes("eai_again") ||
    text.includes("etimedout") ||
    text.includes("timeout")
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

function isAuthenticatedRequest() {
  const cookieStore = cookies();
  return isMasterSession(cookieStore.get(AUTH_COOKIE_NAME)?.value);
}

export async function GET(request: Request) {
  if (!isAuthenticatedRequest()) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") ?? "").trim();
    const status = searchParams.get("status") === "deleted" ? "deleted" : "active";
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 10);
    const year = Number(searchParams.get("year") ?? "");
    const month = Number(searchParams.get("month") ?? "");

    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safePageSize =
      Number.isFinite(pageSize) && pageSize > 0 && pageSize <= 50 ? pageSize : 10;
    const from = (safePage - 1) * safePageSize;
    const to = from + safePageSize - 1;

    const hasValidYear = Number.isInteger(year) && year >= 2000 && year <= 2100;
    const hasValidMonth = Number.isInteger(month) && month >= 1 && month <= 12;

    const runClientListQuery = async () => {
      const supabase = createServiceClient();
      let query = supabase
        .from("clients")
        .select("id, name, stress_factor, location, created_at, deleted_at", {
          count: "exact",
        })
        .range(from, to);

      if (status === "deleted") {
        query = query.not("deleted_at", "is", null).order("deleted_at", {
          ascending: false,
        });
      } else {
        query = query.is("deleted_at", null).order("created_at", {
          ascending: false,
        });
      }

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      if (hasValidYear && hasValidMonth) {
        const fromDate = new Date(Date.UTC(year, month - 1, 1)).toISOString();
        const toDate = new Date(Date.UTC(year, month, 1)).toISOString();
        const targetDateColumn = status === "deleted" ? "deleted_at" : "created_at";
        query = query.gte(targetDateColumn, fromDate).lt(targetDateColumn, toDate);
      }

      return query;
    };

    for (let attempt = 1; attempt <= CLIENT_LIST_MAX_RETRIES; attempt += 1) {
      const { data, count, error } = await runClientListQuery();
      if (!error) {
        return NextResponse.json({
          items: (data ?? []).map((row) => ({
            id: row.id,
            name: row.name,
            stressFactor: row.stress_factor,
            location: row.location,
            createdAt: row.created_at,
            deletedAt: row.deleted_at,
          })),
          totalCount: count ?? 0,
          page: safePage,
          pageSize: safePageSize,
        });
      }

      const canRetry = isRetryableNetworkIssue(error) && attempt < CLIENT_LIST_MAX_RETRIES;
      if (!canRetry) {
        logServerError("api/clients.get", error, {
          attempt,
          maxAttempts: CLIENT_LIST_MAX_RETRIES,
          search,
          status,
          page: safePage,
          pageSize: safePageSize,
        });
        return NextResponse.json({ message: "대상자 목록 조회에 실패했습니다." }, { status: 400 });
      }

      await sleep(attempt * 400);
    }

    return NextResponse.json({ message: "대상자 목록 조회에 실패했습니다." }, { status: 400 });
  } catch (error) {
    logServerError("api/clients.get.unhandled", error);
    return NextResponse.json(
      { message: "대상자 목록 조회 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!isAuthenticatedRequest()) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const originError = requireSameOrigin(request);
  if (originError) {
    return originError;
  }

  try {
    const body = (await request.json()) as CreateClientBody;
    const name = body.name?.trim();
    const birthDate = body.birthDate?.trim();
    const phone = normalizeKoreanMobilePhone(body.phone ?? "");
    const stressFactor = body.stressFactor?.trim();
    const location = body.location?.trim();
    const privacyConsent = body.privacyConsent === true;

    if (!name || !birthDate || !phone || !stressFactor || !location) {
      return NextResponse.json(
        { message: "필수값(name, birthDate, phone, stressFactor, location)을 입력해주세요." },
        { status: 400 },
      );
    }

    if (!isValidKoreanMobilePhone(phone)) {
      return NextResponse.json(
        { message: "휴대번호 형식을 확인해주세요. (예: 010-1234-5678)" },
        { status: 400 },
      );
    }

    if (!privacyConsent) {
      return NextResponse.json(
        { message: "개인정보 수집·이용 동의가 필요합니다." },
        { status: 400 },
      );
    }

    const encryptedPhone = encryptPhone(phone);
    const adminId = await getCurrentAdminId();
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("clients")
      .insert({
        name,
        birth_date: birthDate,
        phone: encryptedPhone,
        stress_factor: stressFactor,
        location,
        privacy_consent: true,
        privacy_consented_at: new Date().toISOString(),
        created_id: adminId,
        updated_id: adminId,
      })
      .select("id, name")
      .single();

    if (error) {
      logServerError("api/clients.post", error);
      return NextResponse.json({ message: "대상자 등록에 실패했습니다." }, { status: 400 });
    }

    return NextResponse.json({
      item: {
        id: data.id,
        name: data.name,
      },
    });
  } catch (error) {
    logServerError("api/clients.post.unhandled", error);
    return NextResponse.json(
      { message: "대상자 등록 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
