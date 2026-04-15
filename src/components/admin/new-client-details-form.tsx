"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function NewClientDetailsForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [stressFactor, setStressFactor] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isDisabled =
    name.trim().length < 2 ||
    !birthDate ||
    stressFactor.trim().length < 1 ||
    location.trim().length < 1;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          birthDate,
          stressFactor: stressFactor.trim(),
          location: location.trim(),
        }),
      });

      const result = (await response.json()) as {
        message?: string;
        item?: { id: string; name: string };
      };

      if (!response.ok || !result.item) {
        setErrorMessage(result.message ?? "대상자 등록 중 오류가 발생했습니다.");
        return;
      }

      const query = new URLSearchParams({
        mode: "new",
        clientId: result.item.id,
        name: result.item.name,
      });
      router.push(`/admin/clients/curriculum?${query.toString()}`);
      router.refresh();
    } catch {
      setErrorMessage("서버와 통신 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="mt-6" onSubmit={handleSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block min-w-0">
          <span className="mb-2 block text-lg font-semibold text-slate-800">이름</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-12 w-full max-w-full rounded-md border border-gray-300 px-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-[#2f4f46] focus:outline-none"
            placeholder="이름을 입력해주세요"
          />
        </label>

        <label className="block min-w-0">
          <span className="mb-2 block text-lg font-semibold text-slate-800">생년월일</span>
          <input
            type="date"
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
            className="h-12 w-full max-w-full appearance-none rounded-md border border-gray-300 px-4 text-base text-gray-900 focus:border-[#2f4f46] focus:outline-none"
          />
        </label>

        <label className="block min-w-0">
          <span className="mb-2 block text-lg font-semibold text-slate-800">스트레스 요인</span>
          <input
            type="text"
            value={stressFactor}
            onChange={(event) => setStressFactor(event.target.value)}
            className="h-12 w-full max-w-full rounded-md border border-gray-300 px-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-[#2f4f46] focus:outline-none"
            placeholder="예: 학업, 진로, 인간관계"
          />
        </label>

        <label className="block min-w-0">
          <span className="mb-2 block text-lg font-semibold text-slate-800">사는곳(동)</span>
          <input
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="h-12 w-full max-w-full rounded-md border border-gray-300 px-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-[#2f4f46] focus:outline-none"
            placeholder="예: 광진구 자양동"
          />
        </label>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isDisabled || isSubmitting}
          className="h-12 flex-1 rounded-md bg-[#2f4f46] text-base font-bold text-white hover:bg-[#223c35] disabled:cursor-not-allowed disabled:bg-[#9aa9a3]"
        >
          {isSubmitting ? "등록 중..." : "대상자 등록 후 커리큘럼 이동"}
        </button>
      </div>

      {errorMessage ? <p className="mt-3 text-sm text-rose-600">{errorMessage}</p> : null}
    </form>
  );
}
