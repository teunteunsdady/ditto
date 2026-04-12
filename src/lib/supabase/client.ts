import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase 환경변수가 비어있습니다. .env.local 파일을 확인해주세요.",
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
