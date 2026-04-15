import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE_NAME, isMasterSession } from "@/lib/auth/master-session";
import { CURRICULUM_TESTS } from "@/lib/curriculum-tests";
import { createServiceClient } from "@/lib/supabase/service";

type CurriculumPageProps = {
  searchParams?: {
    name?: string;
    mode?: string;
    clientId?: string;
  };
};

export default async function CurriculumPage({ searchParams }: CurriculumPageProps) {
  const cookieStore = cookies();
  const authenticated = isMasterSession(cookieStore.get(AUTH_COOKIE_NAME)?.value);

  if (!authenticated) {
    redirect("/login");
  }

  const clientName = searchParams?.name?.trim();
  const clientId = searchParams?.clientId?.trim();
  const title = clientName
    ? `${clientName} 대상자 검사 커리큘럼`
    : "코칭 대상자 검사 커리큘럼";
  const isNewFlow = searchParams?.mode === "new";
  const savedTestSet = new Set<string>();

  if (clientId) {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("client_assessments")
      .select("test_slug")
      .eq("client_id", clientId);
    (data ?? []).forEach((row) => {
      if (row.test_slug) {
        savedTestSet.add(String(row.test_slug));
      }
    });
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-16 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-center text-2xl font-extrabold text-slate-900 sm:text-3xl">{title}</h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          검사 진행 전 상태를 확인하고 순서대로 시작해주세요.
        </p>

        {isNewFlow ? (
          <div className="mt-6 rounded-lg border border-[#c7d4cc] bg-[#edf3ef] px-4 py-3 text-sm text-[#2f4f46]">
            대상자 등록이 완료되었습니다. 바로 검사 단계로 진행할 수 있습니다.
          </div>
        ) : null}

        <div className="mt-8 space-y-4">
          {CURRICULUM_TESTS.map((item) => (
            (() => {
              const isSaved = savedTestSet.has(item.slug);
              return (
            <article
              key={item.order}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-nowrap sm:px-6"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d7e2dc] text-lg font-bold text-[#2f4f46]">
                {item.order}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-slate-900">{item.title}</h2>
                <p className="text-sm text-slate-500">{item.description}</p>
              </div>
              <p
                className={`text-sm font-semibold ${
                  isSaved ? "text-[#2f4f46]" : "text-[#5d6964]"
                }`}
              >
                {isSaved ? "저장됨" : "진행 전"}
              </p>
              {isSaved ? (
                <Link
                  href={`/admin/clients/curriculum/${item.slug}/result?clientId=${clientId ?? ""}&name=${encodeURIComponent(clientName ?? "")}`}
                  className="rounded-lg bg-[#3f5f55] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2f4f46]"
                >
                  결과 보기
                </Link>
              ) : (
                <Link
                  href={`/admin/clients/curriculum/${item.slug}?order=${item.order}&clientId=${clientId ?? ""}&name=${encodeURIComponent(clientName ?? "")}`}
                  className="rounded-lg bg-[#2f4f46] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#223c35]"
                >
                  검사 시작
                </Link>
              )}
            </article>
              );
            })()
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/admin/clients"
            className="rounded-full bg-[#2f4f46] px-8 py-3 text-sm font-semibold text-white hover:bg-[#223c35]"
          >
            대상자 목록으로 돌아가기
          </Link>
        </div>
      </section>
    </main>
  );
}
