import { NextResponse } from "next/server";

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

    const supabase = createServiceClient();
    const { error } = await supabase.from("inquiries").insert({
      name,
      phone,
      email: email || null,
      category: category || null,
      message,
    });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { message: "문의 저장 중 오류가 발생했습니다.", detail: String(error) },
      { status: 500 },
    );
  }
}
