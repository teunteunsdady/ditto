import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, isMasterSession } from "@/lib/auth/master-session";
import { CURRICULUM_TESTS } from "@/lib/curriculum-tests";
import { createServiceClient } from "@/lib/supabase/service";

type RouteParams = {
  params: {
    id: string;
    testSlug: string;
  };
};

type SaveResultBody = {
  resultData?: unknown;
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

function isValidTestSlug(testSlug: string) {
  return CURRICULUM_TESTS.some((test) => test.slug === testSlug);
}

export async function POST(request: Request, { params }: RouteParams) {
  if (!isAuthenticatedRequest()) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const clientId = params.id?.trim();
  const testSlug = params.testSlug?.trim();
  if (!clientId || !testSlug) {
    return NextResponse.json({ message: "Invalid request path" }, { status: 400 });
  }
  if (!isValidTestSlug(testSlug)) {
    return NextResponse.json({ message: "Unknown test slug" }, { status: 400 });
  }

  try {
    const body = (await request.json()) as SaveResultBody;
    const resultData = body.resultData;
    if (!resultData || typeof resultData !== "object") {
      return NextResponse.json({ message: "resultData는 객체 형태여야 합니다." }, { status: 400 });
    }

    const adminId = await getCurrentAdminId();
    const supabase = createServiceClient();

    const { data: clientRow, error: clientError } = await supabase
      .from("clients")
      .select("id")
      .eq("id", clientId)
      .maybeSingle();
    if (clientError) {
      return NextResponse.json({ message: clientError.message }, { status: 400 });
    }
    if (!clientRow) {
      return NextResponse.json({ message: "대상자를 찾을 수 없습니다." }, { status: 404 });
    }

    const { error } = await supabase.from("client_assessments").upsert(
      {
        client_id: clientId,
        test_slug: testSlug,
        result_data: resultData,
        created_admin_id: adminId,
        updated_admin_id: adminId,
      },
      {
        onConflict: "client_id,test_slug",
      },
    );

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to save test result", detail: String(error) },
      { status: 500 },
    );
  }
}

export async function GET(_request: Request, { params }: RouteParams) {
  if (!isAuthenticatedRequest()) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const clientId = params.id?.trim();
  const testSlug = params.testSlug?.trim();
  if (!clientId || !testSlug) {
    return NextResponse.json({ message: "Invalid request path" }, { status: 400 });
  }
  if (!isValidTestSlug(testSlug)) {
    return NextResponse.json({ message: "Unknown test slug" }, { status: 400 });
  }

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("client_assessments")
      .select("result_data, updated_at")
      .eq("client_id", clientId)
      .eq("test_slug", testSlug)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({
      item: data
        ? {
            resultData: data.result_data,
            updatedAt: data.updated_at,
          }
        : null,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch test result", detail: String(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  if (!isAuthenticatedRequest()) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const clientId = params.id?.trim();
  const testSlug = params.testSlug?.trim();
  if (!clientId || !testSlug) {
    return NextResponse.json({ message: "Invalid request path" }, { status: 400 });
  }
  if (!isValidTestSlug(testSlug)) {
    return NextResponse.json({ message: "Unknown test slug" }, { status: 400 });
  }

  try {
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("client_assessments")
      .delete()
      .eq("client_id", clientId)
      .eq("test_slug", testSlug);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete test result", detail: String(error) },
      { status: 500 },
    );
  }
}
