import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE_NAME, isMasterSession } from "@/lib/auth/master-session";

export default function NewClientPage() {
  const cookieStore = cookies();
  const authenticated = isMasterSession(cookieStore.get(AUTH_COOKIE_NAME)?.value);

  if (!authenticated) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-24 sm:px-6">
      <h1 className="text-3xl font-bold">신규 내담자 등록</h1>
      <p className="mt-4 text-sm text-gray-600">
        다음 단계에서 이 페이지에 실제 등록 폼을 붙여 Supabase에 저장하도록 구현하면 됩니다.
      </p>
    </main>
  );
}
