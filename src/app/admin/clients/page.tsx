import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ClientsListTable } from "@/components/admin/clients-list-table";
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
        <h1 className="text-3xl font-bold">코칭 대상자 목록</h1>
        <Link
          href="/admin/clients/new"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          ➕ 코칭 대상자 추가
        </Link>
      </div>

      <ClientsListTable />
    </main>
  );
}
