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
  const isAttachmentResult = currentTest.slug === "attachment";

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                isAttachmentResult
                  ? "border border-[#ded6ff] bg-[#f3f0ff] tracking-[0.12em] text-[#6a55da]"
                  : "bg-[#d7e2dc] text-[#2f4f46]"
              }`}
            >
              {isAttachmentResult ? "COMPREHENSIVE ANALYSIS REPORT" : "검사 결과 보기"}
            </p>
            <h1 className="mt-4 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              {isAttachmentResult ? "애착 유형 분석 결과" : `${currentTest.title} 결과`}
            </h1>
            {isAttachmentResult ? (
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">
                답변하신 데이터를 바탕으로 귀하의 심리적 애착 지표를 분석했습니다.
                본 결과는 타인과의 관계에서 나타나는 고유한 패턴을 보여줍니다.
              </p>
            ) : null}
          </div>
          <div className="pt-1 text-right">
            {clientName ? <p className="text-sm font-medium text-slate-500">대상자: {clientName}</p> : null}
            <p className={`text-sm text-slate-500 ${clientName ? "mt-1" : ""}`}>
              {data?.updated_at
                ? `최종 저장: ${new Date(data.updated_at).toLocaleString("ko-KR")}`
                : "아직 저장된 결과가 없습니다."}
            </p>
          </div>
        </div>

        <div className="mt-8">
          {data?.result_data ? (
            <AssessmentResultView testSlug={currentTest.slug} resultData={data.result_data} />
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              저장된 결과가 없습니다. 검사 화면에서 저장 버튼을 눌러 결과를 먼저 저장해주세요.
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {data?.result_data ? (
            <DeleteAssessmentButton
              clientId={clientId}
              testSlug={currentTest.slug}
              redirectHref={backToTestHref}
            />
          ) : null}
          <Link
            href={backToCurriculumHref}
            className="inline-flex w-full items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
          >
            커리큘럼으로 돌아가기
          </Link>
        </div>
      </section>
    </main>
  );
}
