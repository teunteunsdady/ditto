import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AssessmentResultView } from "@/components/admin/assessment-result-view";
import { DeleteAssessmentButton } from "@/components/admin/delete-assessment-button";
import { AUTH_COOKIE_NAME, isMasterSession } from "@/lib/auth/master-session";
import { CURRICULUM_TESTS } from "@/lib/curriculum-tests";
import { createServiceClient } from "@/lib/supabase/service";

type ResultPageProps = {
  params: {
    testSlug: string;
  };
  searchParams?: {
    clientId?: string;
    name?: string;
  };
};

export default async function CurriculumResultPage({ params, searchParams }: ResultPageProps) {
  const cookieStore = cookies();
  const authenticated = isMasterSession(cookieStore.get(AUTH_COOKIE_NAME)?.value);
  if (!authenticated) {
    redirect("/login");
  }

  const currentTest = CURRICULUM_TESTS.find((item) => item.slug === params.testSlug);
  if (!currentTest) {
    redirect("/admin/clients/curriculum");
  }

  const clientId = searchParams?.clientId?.trim();
  const clientName = searchParams?.name?.trim();
  if (!clientId) {
    redirect("/admin/clients");
  }

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("client_assessments")
    .select("result_data, updated_at")
    .eq("client_id", clientId)
    .eq("test_slug", currentTest.slug)
    .maybeSingle();

  const backToTestHref = `/admin/clients/curriculum/${currentTest.slug}?clientId=${clientId}&name=${encodeURIComponent(clientName ?? "")}`;
  const backToCurriculumHref = `/admin/clients/curriculum?clientId=${clientId}&name=${encodeURIComponent(clientName ?? "")}`;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-16 sm:px-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="rounded-full bg-[#d7e2dc] px-3 py-1 text-xs font-semibold text-[#2f4f46]">
            검사 결과 보기
          </p>
          {clientName ? <p className="text-sm font-medium text-slate-500">대상자: {clientName}</p> : null}
        </div>

        <h1 className="mt-4 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          {currentTest.title} 결과
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {data?.updated_at
            ? `최종 저장: ${new Date(data.updated_at).toLocaleString("ko-KR")}`
            : "아직 저장된 결과가 없습니다."}
        </p>

        <div className="mt-8">
          {data?.result_data ? (
            <AssessmentResultView testSlug={currentTest.slug} resultData={data.result_data} />
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              저장된 결과가 없습니다. 검사 화면에서 저장 버튼을 눌러 결과를 먼저 저장해주세요.
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {data?.result_data ? (
            <DeleteAssessmentButton
              clientId={clientId}
              testSlug={currentTest.slug}
              redirectHref={backToTestHref}
            />
          ) : null}
          <Link
            href={backToCurriculumHref}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            커리큘럼으로 돌아가기
          </Link>
        </div>
      </section>
    </main>
  );
}
