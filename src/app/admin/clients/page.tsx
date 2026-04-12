import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AUTH_COOKIE_NAME, isMasterSession } from "@/lib/auth/master-session";

export default function ClientsPage() {
  const cookieStore = cookies();
  const authenticated = isMasterSession(cookieStore.get(AUTH_COOKIE_NAME)?.value);

  if (!authenticated) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-24 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">내담자 조회 및 관리</h1>
        <Link
          href="/admin/clients/new"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          신규 내담자 등록
        </Link>
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-600">
        아직 등록된 내담자가 없습니다.
      </div>
    </main>
  );
}
