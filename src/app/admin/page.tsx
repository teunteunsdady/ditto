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
      <h1 className="text-3xl font-bold">운영 대시보드</h1>
      <p className="mt-3 text-sm text-gray-600">로그인한 운영자만 접근 가능한 메뉴입니다.</p>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/clients/new"
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:border-gray-300"
        >
          <h2 className="text-lg font-semibold">신규 내담자 등록</h2>
          <p className="mt-2 text-sm text-gray-600">새로운 내담자 정보를 등록하는 화면으로 이동합니다.</p>
        </Link>

        <Link
          href="/admin/clients"
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:border-gray-300"
        >
          <h2 className="text-lg font-semibold">내담자 조회 및 관리</h2>
          <p className="mt-2 text-sm text-gray-600">등록된 내담자 목록을 조회하고 관리하는 화면으로 이동합니다.</p>
        </Link>
      </section>
    </main>
  );
}
