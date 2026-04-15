"use client";

import { FormEvent, useState } from "react";

const CATEGORY_OPTIONS = [
  "퍼스널 코어 프로그램",
  "그룹 코어 프로그램",
  "새학기 온보딩 코칭",
  "기타 문의",
] as const;

export default function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORY_OPTIONS)[number]>(
    "퍼스널 코어 프로그램",
  );
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState<"success" | "error">(
    "success",
  );

  const isDisabled =
    isSubmitting ||
    name.trim().length < 2 ||
    phone.trim().length < 7 ||
    message.trim().length < 10;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          category,
          message: message.trim(),
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setFeedbackType("error");
        setFeedback(payload?.message ?? "문의 등록에 실패했습니다.");
        return;
      }

      setFeedbackType("success");
      setFeedback("문의가 정상 접수되었습니다. 빠르게 연락드릴게요.");
      setName("");
      setPhone("");
      setEmail("");
      setCategory("퍼스널 코어 프로그램");
      setMessage("");
    } catch {
      setFeedbackType("error");
      setFeedback("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-2xl font-bold text-[#1f3a33] sm:text-3xl">상담 문의</h1>
      <p className="mt-6 text-sm leading-7 text-[#51605a] sm:text-base">
        코어그라운드는 개인/그룹/온보딩 목적에 맞는 프로그램을 제안합니다. 참여 대상,
        기대하는 변화, 운영 희망 시기를 남겨주시면 상담을 통해 맞춤형 흐름을 안내드립니다.
      </p>

      <section className="mt-8 rounded-xl border border-[#d8d3c5] bg-[#f6f2e8] p-4 sm:p-5">
        <p className="text-sm font-semibold text-[#2f4f46]">상담 시 확인 항목</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#4f5b57]">
          <li>참여 대상(개인/그룹/신입·신입사원)</li>
          <li>현재 고민(관계, 적응, 정서, 목표 설정 등)</li>
          <li>희망 운영 방식(오프라인/온라인, 횟수, 기간)</li>
        </ul>
      </section>

      <section className="mt-8 rounded-xl border border-[#d8d3c5] bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-lg font-bold text-[#1f3a33]">상담 신청서</h2>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block min-w-0">
              <span className="mb-2 block text-sm font-semibold text-[#314740]">
                이름
              </span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-11 w-full max-w-full rounded-md border border-[#cfc8b5] px-3 text-sm focus:border-[#2f4f46] focus:outline-none"
                placeholder="이름을 입력해주세요"
              />
            </label>
            <label className="block min-w-0">
              <span className="mb-2 block text-sm font-semibold text-[#314740]">
                연락처
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="h-11 w-full max-w-full rounded-md border border-[#cfc8b5] px-3 text-sm focus:border-[#2f4f46] focus:outline-none"
                placeholder="010-0000-0000"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block min-w-0">
              <span className="mb-2 block text-sm font-semibold text-[#314740]">
                이메일(선택)
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 w-full max-w-full rounded-md border border-[#cfc8b5] px-3 text-sm focus:border-[#2f4f46] focus:outline-none"
                placeholder="example@email.com"
              />
            </label>
            <label className="block min-w-0">
              <span className="mb-2 block text-sm font-semibold text-[#314740]">
                희망 프로그램
              </span>
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as (typeof CATEGORY_OPTIONS)[number])
                }
                className="h-11 w-full max-w-full rounded-md border border-[#cfc8b5] px-3 text-sm focus:border-[#2f4f46] focus:outline-none"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block min-w-0">
            <span className="mb-2 block text-sm font-semibold text-[#314740]">
              문의 내용
            </span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={6}
              className="w-full max-w-full rounded-md border border-[#cfc8b5] px-3 py-2 text-sm focus:border-[#2f4f46] focus:outline-none"
              placeholder="현재 고민, 목표, 희망 운영 형태를 자유롭게 남겨주세요."
            />
          </label>

          {feedback ? (
            <p
              className={`text-sm ${
                feedbackType === "success" ? "text-emerald-700" : "text-rose-600"
              }`}
            >
              {feedback}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isDisabled}
            className="h-11 rounded-md bg-[#2f4f46] px-5 text-sm font-semibold text-white hover:bg-[#223c35] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "접수 중..." : "상담 문의 접수"}
          </button>
        </form>
      </section>
    </main>
  );
}
