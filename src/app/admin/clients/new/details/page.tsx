import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { NewClientDetailsForm } from "@/components/admin/new-client-details-form";
import { AUTH_COOKIE_NAME, isMasterSession } from "@/lib/auth/master-session";

export default function NewClientDetailsPage() {
  const cookieStore = cookies();
  const authenticated = isMasterSession(cookieStore.get(AUTH_COOKIE_NAME)?.value);

  if (!authenticated) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-16 sm:px-6">
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">대상자 정보</h1>
        <p className="mt-2 text-sm text-slate-500">
          인적사항 등록 후 바로 검사 커리큘럼으로 이어집니다.
        </p>
        <div className="mt-5 h-px w-full bg-gray-200" />

        <NewClientDetailsForm />
      </section>
    </main>
  );
}
