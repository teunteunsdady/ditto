"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function NewClientDetailsForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [stressFactor, setStressFactor] = useState("");
  const [location, setLocation] = useState("");

  const isDisabled =
    name.trim().length < 2 ||
    !birthDate ||
    stressFactor.trim().length < 1 ||
    location.trim().length < 1;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = new URLSearchParams({
      mode: "new",
      name: name.trim(),
      birthDate,
      stressFactor: stressFactor.trim(),
      location: location.trim(),
    });
    router.push(`/admin/clients/curriculum?${query.toString()}`);
  };

  return (
    <form className="mt-6" onSubmit={handleSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-lg font-semibold text-slate-800">이름</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-12 w-full rounded-md border border-gray-300 px-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
            placeholder="이름을 입력해주세요"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-lg font-semibold text-slate-800">생년월일</span>
          <input
            type="date"
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
            className="h-12 w-full rounded-md border border-gray-300 px-4 text-base text-gray-900 focus:border-blue-500 focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-lg font-semibold text-slate-800">스트레스 요인</span>
          <input
            type="text"
            value={stressFactor}
            onChange={(event) => setStressFactor(event.target.value)}
            className="h-12 w-full rounded-md border border-gray-300 px-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
            placeholder="예: 학업, 진로, 인간관계"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-lg font-semibold text-slate-800">사는곳(동)</span>
          <input
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="h-12 w-full rounded-md border border-gray-300 px-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
            placeholder="예: 광진구 자양동"
          />
        </label>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isDisabled}
          className="h-12 flex-1 rounded-md bg-blue-600 text-base font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          대상자 등록 후 커리큘럼 이동
        </button>
      </div>
    </form>
  );
}
