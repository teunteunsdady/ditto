"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function NewClientDetailsForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [stressFactor, setStressFactor] = useState("");
  const [location, setLocation] = useState("");
  const [agreedPrivacyPolicy, setAgreedPrivacyPolicy] = useState(false);
  const [isPrivacyDialogOpen, setIsPrivacyDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const normalizedPhone = phone.replace(/\s+/g, "").trim();
  const hasValidPhone = /^[0-9-]{9,15}$/.test(normalizedPhone);
  const isDisabled =
    name.trim().length < 2 ||
    !birthDate ||
    !hasValidPhone ||
    stressFactor.trim().length < 1 ||
    location.trim().length < 1 ||
    !agreedPrivacyPolicy;

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
          phone: normalizedPhone,
          stressFactor: stressFactor.trim(),
          location: location.trim(),
          privacyConsent: agreedPrivacyPolicy,
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

        <label className="block min-w-0 md:col-span-2">
          <span className="mb-2 block text-lg font-semibold text-slate-800">휴대번호</span>
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="h-12 w-full max-w-full rounded-md border border-gray-300 px-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-[#2f4f46] focus:outline-none"
            placeholder="예: 010-1234-5678"
            inputMode="numeric"
          />
          {!hasValidPhone && normalizedPhone ? (
            <p className="mt-2 text-sm text-rose-600">휴대번호 형식을 확인해주세요. (숫자/하이픈 9~15자)</p>
          ) : null}
        </label>
      </div>

      <div className="mt-6 rounded-md border border-gray-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">개인정보 수집·이용 동의(필수)</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          대상자 등록 및 상담 운영을 위해 이름, 생년월일, 휴대번호, 상담 관련 정보(스트레스 요인, 거주
          동)를 수집·이용합니다. 수집된 정보는 상담 관리 목적 외에는 사용하지 않습니다.
        </p>
        <label className="mt-3 flex items-start gap-2 text-sm text-slate-800">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-gray-300"
            checked={agreedPrivacyPolicy}
            onChange={(event) => setAgreedPrivacyPolicy(event.target.checked)}
          />
          <span>개인정보 수집·이용에 동의합니다.</span>
        </label>
        <p className="mt-2 text-xs text-slate-600">
          <Dialog open={isPrivacyDialogOpen} onOpenChange={setIsPrivacyDialogOpen}>
            <DialogTrigger asChild>
              <button type="button" className="mr-2 underline underline-offset-2">
                약관 자세히 보기
              </button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>개인정보 수집·이용 동의(필수)</DialogTitle>
                <DialogDescription>
                  대상자 등록 시 필요한 최소 정보만 수집하며, 상담 운영 목적 외에는 이용하지 않습니다.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm leading-6 text-slate-700">
                <p>
                  <span className="font-semibold text-slate-900">1. 수집 항목</span>
                  <br />
                  이름, 생년월일, 휴대번호, 스트레스 요인, 사는곳(동), 동의 여부 및 동의 시각
                </p>
                <p>
                  <span className="font-semibold text-slate-900">2. 이용 목적</span>
                  <br />
                  대상자 등록, 상담/검사 운영, 상담 이력 관리, 서비스 품질 및 보안 관리
                </p>
                <p>
                  <span className="font-semibold text-slate-900">3. 보유 및 이용 기간</span>
                  <br />
                  수집일로부터 최대 1년 보관 후 파기(법령상 보존 의무가 있는 경우 제외)
                </p>
                <p>
                  <span className="font-semibold text-slate-900">4. 동의 거부권</span>
                  <br />
                  정보주체는 동의를 거부할 권리가 있으며, 필수 항목 동의가 없으면 대상자 등록이 제한될 수
                  있습니다.
                </p>
                <p>
                  세부 방침은 아래 링크에서 확인할 수 있습니다.
                  <br />
                  <Link href="/privacy-policy" target="_blank" className="underline underline-offset-2">
                    개인정보처리방침 전체 보기
                  </Link>
                </p>
              </div>
            </DialogContent>
          </Dialog>
          세부 내용은{" "}
          <Link href="/privacy-policy" target="_blank" className="underline underline-offset-2">
            개인정보처리방침
          </Link>
          에서 확인할 수 있습니다.
        </p>
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
