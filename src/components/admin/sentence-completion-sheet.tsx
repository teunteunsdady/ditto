"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type SentenceCompletionSheetProps = {
  clientId?: string;
  testSlug: string;
};

type AnswerMap = Record<number, string>;

const SENTENCE_PROMPTS = [
  "나는 요즘 가장 자주 ____ 라고 느낀다.",
  "사람들과 함께 있을 때 나는 ____ 하다.",
  "내가 가장 불안해지는 순간은 ____ 할 때다.",
  "어릴 때 나에게 가장 큰 영향을 준 경험은 ____ 이다.",
  "누군가 나를 비판하면 나는 보통 ____ 한다.",
  "내가 바라는 관계는 ____ 한 관계다.",
  "나는 스스로를 ____ 한 사람이라고 생각한다.",
  "앞으로 꼭 바꾸고 싶은 나의 모습은 ____ 이다.",
] as const;

function normalizeAnswerMap(value: unknown): AnswerMap {
  if (!value || typeof value !== "object") return {};
  return Object.entries(value as Record<string, unknown>).reduce<AnswerMap>((acc, [key, raw]) => {
    const no = Number(key);
    if (!Number.isFinite(no) || typeof raw !== "string") return acc;
    acc[no] = raw;
    return acc;
  }, {});
}

export function SentenceCompletionSheet({ clientId, testSlug }: SentenceCompletionSheetProps) {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [missingNumbers, setMissingNumbers] = useState<number[]>([]);
  const resultHref = clientId ? `/admin/clients/curriculum/${testSlug}/result?clientId=${clientId}` : "";

  useEffect(() => {
    if (!clientId) return;

    const controller = new AbortController();
    const loadSavedResult = async () => {
      try {
        const response = await fetch(`/api/clients/${clientId}/tests/${testSlug}`, {
          signal: controller.signal,
        });
        const payload = (await response.json().catch(() => null)) as
          | { item?: { resultData?: { answers?: unknown } | null } | null }
          | null;
        if (!response.ok || !payload?.item?.resultData) return;
        setAnswers(normalizeAnswerMap(payload.item.resultData.answers));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    };

    void loadSavedResult();
    return () => controller.abort();
  }, [clientId, testSlug]);

  const answeredCount = useMemo(
    () =>
      SENTENCE_PROMPTS.filter((_, index) => {
        const value = answers[index + 1];
        return typeof value === "string" && value.trim().length > 0;
      }).length,
    [answers],
  );

  const saveResult = async () => {
    if (!clientId) {
      setSaveState("error");
      setSaveMessage("대상자 정보가 없어 저장할 수 없습니다.");
      return;
    }

    const missing = SENTENCE_PROMPTS.map((_, index) => index + 1).filter(
      (no) => (answers[no] ?? "").trim().length === 0,
    );
    if (missing.length > 0) {
      setMissingNumbers(missing);
      setSaveState("error");
      setSaveMessage(`미작성 문항 ${missing.length}개가 있습니다.`);
      return;
    }

    setSaveState("saving");
    setSaveMessage("");
    setMissingNumbers([]);

    try {
      const response = await fetch(`/api/clients/${clientId}/tests/${testSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resultData: {
            prompts: SENTENCE_PROMPTS,
            answers,
          },
        }),
      });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) throw new Error(payload?.message ?? "저장에 실패했습니다.");
      setSaveState("saved");
      setSaveMessage("검사 결과가 저장되었습니다.");
    } catch (error) {
      setSaveState("error");
      setSaveMessage(error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="space-y-3 rounded-xl border border-slate-300 bg-white p-4 sm:p-6">
        {SENTENCE_PROMPTS.map((prompt, index) => {
          const no = index + 1;
          return (
            <label key={no} className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-800">
                {no}. {prompt}
              </span>
              <textarea
                value={answers[no] ?? ""}
                onChange={(event) => {
                  const next = event.target.value;
                  setAnswers((prev) => ({ ...prev, [no]: next }));
                  setMissingNumbers((prev) => prev.filter((value) => value !== no));
                }}
                rows={2}
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
                  missingNumbers.includes(no)
                    ? "border-rose-300 focus:border-rose-500"
                    : "border-slate-300 focus:border-[#2f4f46]"
                }`}
                placeholder="문장을 완성해 입력해주세요."
              />
            </label>
          );
        })}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={saveResult}
            disabled={saveState === "saving"}
            className="rounded-md border border-[#bcc7c1] px-3 py-1.5 text-sm text-[#2f4f46] hover:bg-[#edf3ef] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saveState === "saving" ? "저장 중..." : "💾 저장"}
          </button>
          <p className="text-xs text-slate-500">
            작성 {answeredCount} / {SENTENCE_PROMPTS.length}
          </p>
        </div>
        {missingNumbers.length > 0 ? (
          <p className="mt-2 text-xs text-rose-600">미작성 번호: {missingNumbers.join(", ")}</p>
        ) : null}
        {saveMessage ? (
          <p className={`mt-2 text-xs ${saveState === "error" ? "text-rose-600" : "text-emerald-600"}`}>
            {saveMessage}
          </p>
        ) : null}
        {saveState === "saved" && clientId ? (
          <Link href={resultHref} className="mt-2 inline-flex text-xs font-semibold text-[#2f4f46] hover:text-[#1f3a33]">
            저장된 결과 보기
          </Link>
        ) : null}
      </div>
    </div>
  );
}
