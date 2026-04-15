import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SixShapeTestBoard } from "@/components/admin/six-shape-test-board";
import { LifeGraphBoard } from "@/components/admin/life-graph-board";
import { PersonalityTestSheet } from "@/components/admin/personality-test-sheet";
import { PersonalityPlusSheet } from "@/components/admin/personality-plus-sheet";
import { AUTH_COOKIE_NAME, isMasterSession } from "@/lib/auth/master-session";
import { CURRICULUM_TESTS } from "@/lib/curriculum-tests";

type TestPageProps = {
  params: {
    testSlug: string;
  };
  searchParams?: {
    name?: string;
    clientId?: string;
  };
};

const sampleQuestions = [
  "최근 2주 동안 감정 기복이 잦다고 느꼈다.",
  "타인의 기대에 대한 부담감을 자주 느낀다.",
  "새로운 과제를 시작할 때 불안감이 먼저 든다.",
  "하루를 마무리할 때 피로감이 크다.",
  "의사결정 시 확신보다 망설임이 큰 편이다.",
];

export default function CurriculumTestPage({ params, searchParams }: TestPageProps) {
  const cookieStore = cookies();
  const authenticated = isMasterSession(cookieStore.get(AUTH_COOKIE_NAME)?.value);

  if (!authenticated) {
    redirect("/login");
  }

  const currentTest = CURRICULUM_TESTS.find((item) => item.slug === params.testSlug);
  if (!currentTest) {
    redirect("/admin/clients/curriculum");
  }

  const clientName = searchParams?.name?.trim();
  const clientId = searchParams?.clientId?.trim();

  const backHref = `/admin/clients/curriculum?clientId=${clientId ?? ""}&name=${encodeURIComponent(clientName ?? "")}`;

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-16 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="rounded-full bg-[#d7e2dc] px-3 py-1 text-xs font-semibold text-[#2f4f46]">
            검사 {currentTest.order} / {CURRICULUM_TESTS.length}
          </p>
          {clientName ? <p className="text-sm font-medium text-slate-500">대상자: {clientName}</p> : null}
        </div>

        <h1 className="mt-4 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          {currentTest.title}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{currentTest.description}</p>

        {currentTest.slug === "shape-6" ? <SixShapeTestBoard clientId={clientId} /> : null}
        {currentTest.slug === "life-graph" ? <LifeGraphBoard clientId={clientId} /> : null}
        {currentTest.slug === "personality" ? (
          <PersonalityTestSheet clientId={clientId} testSlug={currentTest.slug} />
        ) : null}
        {currentTest.slug === "personality-plus" ? <PersonalityPlusSheet /> : null}

        {currentTest.slug !== "shape-6" &&
        currentTest.slug !== "life-graph" &&
        currentTest.slug !== "personality" &&
        currentTest.slug !== "personality-plus" ? (
          <div className="mt-8 space-y-4">
            {sampleQuestions.map((question, index) => (
              <article key={question} className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-800">
                  {index + 1}. {question}
                </p>
                <div className="mt-3 grid grid-cols-5 gap-2 text-xs">
                  {["매우 아니다", "아니다", "보통", "그렇다", "매우 그렇다"].map((label) => (
                    <button
                      key={label}
                      type="button"
                      className="rounded-md border border-slate-300 px-2 py-2 text-slate-600 hover:border-[#2f4f46] hover:text-[#1f3a33]"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap justify-start gap-3">
          <Link
            href={backHref}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            커리큘럼으로 돌아가기
          </Link>
        </div>
      </section>
    </main>
  );
}
