"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { PERSONALITY_QUESTIONS, PERSONALITY_SCALE_OPTIONS } from "@/lib/personality-questions";

type PersonalityTestSheetProps = {
  clientId?: string;
  testSlug: string;
};

type AnswerMap = Record<number, number>;

function normalizeAnswerMap(value: unknown): AnswerMap {
  if (!value || typeof value !== "object") return {};
  const entries = Object.entries(value as Record<string, unknown>);
  return entries.reduce<AnswerMap>((acc, [key, raw]) => {
    const no = Number(key);
    const score = Number(raw);
    if (!Number.isFinite(no) || !Number.isFinite(score)) return acc;
    if (score < 1 || score > 5) return acc;
    acc[no] = score;
    return acc;
  }, {});
}

export function PersonalityTestSheet({ clientId, testSlug }: PersonalityTestSheetProps) {
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
    () => PERSONALITY_QUESTIONS.filter((question) => answers[question.no] != null).length,
    [answers],
  );

  const handleSelect = (no: number, score: number) => {
    setAnswers((prev) => ({ ...prev, [no]: score }));
    setMissingNumbers((prev) => prev.filter((item) => item !== no));
  };

  const saveResult = async () => {
    if (!clientId) {
      setSaveState("error");
      setSaveMessage("대상자 정보가 없어 저장할 수 없습니다.");
      return;
    }

    setSaveState("saving");
    setSaveMessage("");

    const missing = PERSONALITY_QUESTIONS.filter((question) => answers[question.no] == null).map(
      (question) => question.no,
    );
    if (missing.length > 0) {
      setSaveState("error");
      setMissingNumbers(missing);
      setSaveMessage(`미응답 문항 ${missing.length}개가 있습니다. 문항 번호를 확인해주세요.`);
      return;
    }
    setMissingNumbers([]);

    try {
      const response = await fetch(`/api/clients/${clientId}/tests/${testSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resultData: {
            answers,
            answeredCount,
            totalQuestions: PERSONALITY_QUESTIONS.length,
            scale: PERSONALITY_SCALE_OPTIONS,
          },
        }),
      });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.message ?? "저장에 실패했습니다.");
      }

      setSaveState("saved");
      setSaveMessage("검사 결과가 저장되었습니다.");
    } catch (error) {
      setSaveState("error");
      setSaveMessage(error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white">
        <table className="min-w-[760px] w-full border-collapse text-xs sm:min-w-[900px] sm:text-sm">
          <thead className="bg-slate-100 text-slate-900">
            <tr>
              <th className="border border-slate-300 px-3 py-2 text-center font-semibold">번호</th>
              <th className="border border-slate-300 px-3 py-2 text-left font-semibold">문항</th>
              {PERSONALITY_SCALE_OPTIONS.map((option) => (
                <th key={option.value} className="border border-slate-300 px-3 py-2 text-center font-semibold">
                  {option.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERSONALITY_QUESTIONS.map((question) => (
              <tr
                key={question.no}
                className={`odd:bg-white even:bg-slate-50 ${
                  missingNumbers.includes(question.no) ? "bg-rose-50" : ""
                }`}
              >
                <td className="border border-slate-200 px-3 py-2 text-center">{question.no}</td>
                <td className="border border-slate-200 px-3 py-2">{question.text}</td>
                {PERSONALITY_SCALE_OPTIONS.map((option) => (
                  <td key={option.value} className="border border-slate-200 px-3 py-2 text-center">
                    <input
                      type="radio"
                      name={`question-${question.no}`}
                      value={option.value}
                      checked={answers[question.no] === option.value}
                      onChange={() => handleSelect(question.no, option.value)}
                      className="h-4 w-4 accent-[#2f4f46]"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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
            응답 {answeredCount} / {PERSONALITY_QUESTIONS.length}
          </p>
        </div>
        {missingNumbers.length > 0 ? (
          <p className="mt-2 text-xs text-rose-600">
            미응답 번호: {missingNumbers.join(", ")}
          </p>
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
