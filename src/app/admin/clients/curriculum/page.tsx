import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE_NAME, isMasterSession } from "@/lib/auth/master-session";

const curriculum = [
  { order: 1, title: "6도형 검사", description: "심층 상황 파악" },
  { order: 2, title: "인생그래프", description: "삶의 궤적 시각화" },
  { order: 3, title: "성격유형 검사", description: "성격 유형 분석" },
  { order: 4, title: "성격유형 검사(심화)", description: "성격 유형 심화 분석" },
  { order: 5, title: "애착유형 검사", description: "대인관계 패턴 및 정서적 유대 분석" },
  { order: 6, title: "핵심감정 검사", description: "내면 감정 파악" },
];

type CurriculumPageProps = {
  searchParams?: {
    name?: string;
    mode?: string;
  };
};

export default function CurriculumPage({ searchParams }: CurriculumPageProps) {
  const cookieStore = cookies();
  const authenticated = isMasterSession(cookieStore.get(AUTH_COOKIE_NAME)?.value);

  if (!authenticated) {
    redirect("/login");
  }

  const clientName = searchParams?.name?.trim();
  const title = clientName
    ? `${clientName} 대상자 검사 커리큘럼`
    : "코칭 대상자 검사 커리큘럼";
  const isNewFlow = searchParams?.mode === "new";

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-16 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-center text-2xl font-extrabold text-slate-900 sm:text-3xl">{title}</h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          검사 진행 전 상태를 확인하고 순서대로 시작해주세요.
        </p>

        {isNewFlow ? (
          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            대상자 등록이 완료되었습니다. 바로 검사 단계로 진행할 수 있습니다.
          </div>
        ) : null}

        <div className="mt-8 space-y-4">
          {curriculum.map((item) => (
            <article
              key={item.order}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-nowrap sm:px-6"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                {item.order}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-slate-900">{item.title}</h2>
                <p className="text-sm text-slate-500">{item.description}</p>
              </div>
              <p className="text-sm font-semibold text-sky-600">진행 전</p>
              <button
                type="button"
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                검사 시작
              </button>
            </article>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/admin/clients"
            className="rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            대상자 목록으로 돌아가기
          </Link>
        </div>
      </section>
    </main>
  );
}
