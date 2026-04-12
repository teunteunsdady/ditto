import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE_NAME, isMasterSession } from "@/lib/auth/master-session";

export default function AdminPage() {
  const cookieStore = cookies();
  const authenticated = isMasterSession(cookieStore.get(AUTH_COOKIE_NAME)?.value);

  if (!authenticated) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-24 sm:px-6">
      <h1 className="text-3xl font-bold">코칭대상자 관리 화면</h1>
      <p className="mt-3 text-sm text-gray-600">코칭 대상자 등록 및 목록 확인 메뉴입니다.</p>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/clients/new"
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:border-gray-300"
        >
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <span aria-hidden>➕</span>
            코칭 대상자 추가
          </h2>
          <p className="mt-2 text-sm text-gray-600">새로운 코칭 대상자 정보를 등록하는 화면으로 이동합니다.</p>
        </Link>

        <Link
          href="/admin/clients"
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:border-gray-300"
        >
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <span aria-hidden>📋</span>
            목록보기
          </h2>
          <p className="mt-2 text-sm text-gray-600">등록된 코칭 대상자 목록을 확인하는 화면으로 이동합니다.</p>
        </Link>
      </section>
    </main>
  );
}
