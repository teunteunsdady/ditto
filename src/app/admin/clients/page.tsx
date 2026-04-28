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
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold sm:text-3xl">코칭 대상자 목록</h1>
        <Link
          href="/admin/clients/new"
          className="inline-flex items-center justify-center rounded-md border border-[#2f4f46] bg-white px-4 py-2 text-sm font-medium text-black hover:bg-[#f5f7f6]"
        >
          ➕ 코칭 대상자 추가
        </Link>
      </div>

      <ClientsListTable />
    </main>
  );
}
