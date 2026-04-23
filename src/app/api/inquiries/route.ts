import { NextResponse } from "next/server";

import { checkRateLimit } from "@/lib/security/rate-limit";
import { logServerError } from "@/lib/security/api-error";
import { createAnonServerClient } from "@/lib/supabase/anon-server";
import { createServiceClient } from "@/lib/supabase/service";

type InquiryBody = {
  name?: string;
  phone?: string;
  email?: string;
  category?: string;
  message?: string;
};

function normalizePhone(value: string) {
  return value.replace(/\s+/g, "").trim();
}

export async function POST(request: Request) {
  const limit = checkRateLimit(request, "inquiries", 12, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfterSeconds),
        },
      },
    );
  }

  try {
    const body = (await request.json()) as InquiryBody;
    const name = body.name?.trim();
    const phone = normalizePhone(body.phone ?? "");
    const email = body.email?.trim().toLowerCase();
    const category = body.category?.trim();
    const message = body.message?.trim();

    if (!name || !phone || !message) {
      return NextResponse.json(
        { message: "이름, 연락처, 문의 내용을 입력해주세요." },
        { status: 400 },
      );
    }

    if (name.length > 50) {
      return NextResponse.json(
        { message: "이름은 50자 이내로 입력해주세요." },
        { status: 400 },
      );
    }

    if (phone.length > 30) {
      return NextResponse.json(
        { message: "연락처는 30자 이내로 입력해주세요." },
        { status: 400 },
      );
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "이메일 형식이 올바르지 않습니다." },
        { status: 400 },
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { message: "문의 내용은 2000자 이내로 입력해주세요." },
        { status: 400 },
      );
    }

    const payload = {
      name,
      phone,
      email: email || null,
      category: category || null,
      message,
    };

    const anonClient = createAnonServerClient();
    const { error: anonError } = await anonClient.from("inquiries").insert(payload);

    if (anonError) {
      logServerError("api/inquiries.insert.anon", anonError);

      // RLS/권한 설정 전환 중인 환경을 위해 서비스 키 fallback 제공 (기본 on)
      if (process.env.INQUIRIES_DISABLE_SERVICE_FALLBACK === "true") {
        return NextResponse.json({ message: "문의 저장에 실패했습니다." }, { status: 400 });
      }

      const serviceClient = createServiceClient();
      const { error: serviceError } = await serviceClient.from("inquiries").insert(payload);
      if (serviceError) {
        logServerError("api/inquiries.insert.service_fallback", serviceError);
        return NextResponse.json({ message: "문의 저장에 실패했습니다." }, { status: 400 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    logServerError("api/inquiries.unhandled", error);
    return NextResponse.json(
      { message: "문의 저장 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
