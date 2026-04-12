"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setMessage("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        setMessage("로그인 성공! 홈으로 이동합니다.");
        router.push("/");
        router.refresh();
      }
    } catch {
      setMessage("로그인 처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-24 sm:px-6">
      <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">운영자 로그인</h1>
        <p className="mt-2 text-sm text-gray-600">
          마스터 계정만 로그인 가능한 운영 대시보드 전용 로그인입니다.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium">
            이메일
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="you@example.com"
            />
          </label>

          <label className="block text-sm font-medium">
            비밀번호
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="비밀번호"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {isSubmitting ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {message ? <p className="mt-4 text-sm text-gray-700">{message}</p> : null}

        <Link href="/" className="mt-6 inline-block text-sm text-blue-600 hover:text-blue-700">
          홈으로 돌아가기
        </Link>
      </section>
    </main>
  );
}
