"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type AdultAttachmentSheetProps = {
  clientId?: string;
  testSlug: string;
};

type AnswerMap = Record<number, number>;

const SCALE_OPTIONS = [
  { value: 1, label: "전혀 그렇지 않다 (1점)" },
  { value: 2, label: "그렇지 않다 (2점)" },
  { value: 3, label: "보통이다 (3점)" },
  { value: 4, label: "대체로 그렇다 (4점)" },
  { value: 5, label: "매우 그렇다 (5점)" },
] as const;

const ATTACHMENT_QUESTIONS = [
  "내가 얼마나 호감을 가지고 있는지 상대방에게 보이고 싶지 않다.",
  "나는 버림을 받는 것에 대해 걱정하는 편이다.",
  "나는 다른 사람과 가까워지는 것이 매우 편안하다.",
  "나는 다른 사람과의 관계에 대해 많이 걱정하는 편이다.",
  "상대방이 막 나와 친해지려고 할 때 꺼려하는 나를 발견한다.",
  "내가 다른 사람에게 관심을 가지는 만큼 그들이 나에게 관심을 가지지 않을까봐 걱정이다.",
  "나는 다른 사람이 나와 매우 가까워지려할 때 불편하다.",
  "나는 나와 친한 사람을 잃을까봐 걱정이 된다.",
  "나는 다른 사람에게 마음을 여는 것이 편안하지 못하다.",
  "나는 종종 내가 상대방에게 호의를 보이는 만큼 상대방도 그렇게 해주기를 바란다.",
  "나는 상대방과 가까워지기를 원하지만 나는 다시 생각을 바꾸어 그만둔다.",
  "나는 상대방과 하나가 되길 원하기 때문에 사람들이 때때로 나에게서 멀어진다.",
  "나는 다른 사람이 나와 너무 가까워졌을 때 예민해진다.",
  "나는 혼자 남겨질까봐 걱정이다.",
  "나는 다른 사람에게 내 생각과 감정을 이야기 하는 것이 편하다.",
  "지나치게 친밀해지고자 하는 욕심 때문에 사람들이 두려워하여 거리를 둔다.",
  "나는 상대방과 너무 가까워지는 것을 피하려고 한다.",
  "나는 상대방으로부터 사랑받고 있다는 것을 자주 확인받고 싶어한다.",
  "나는 다른 사람과 가까워지는 것이 비교적 쉽다.",
  "가끔 나는 다른 사람에게 더 많은 애정과 더 많은 헌신을 보여줄 것을 강요한다고 느낀다.",
  "나는 다른 사람을 의지하기가 어렵다.",
  "나는 버림받는 것에 대해 때때로 걱정하지 않는다.",
  "나는 다른 사람과 너무 가까워지는 것을 좋아하지 않는다.",
  "만약 상대방이 나에게 관심을 보이지 않는다면 나는 화가 난다.",
  "나는 상대방에게 모든 것을 이야기 한다.",
  "상대방이 내가 원하는 만큼 가까워지는 것을 원치 않음을 안다.",
  "나는 대개 다른 사람에게 내 문제와 고민을 상의한다.",
  "내가 다른 사람과 교류가 없을 때 나는 다소 걱정스럽고 불안하다.",
  "다른 사람에게 의지하는 것이 편안하다.",
  "상대방이 내가 원하는 만큼 가까이에 있지 않을 때 실망하게 된다.",
  "나는 상대방에게 위로, 조언 또는 도움을 청하지 못한다.",
  "내가 필요로 할 때 상대방이 거절한다면 실망하게 된다.",
  "내가 필요로 할 때 상대방에게 의지하면 도움이 된다.",
  "상대방이 나에게 불만을 나타낼 때 나 자신이 정말 형편없게 느껴진다.",
  "나는 위로와 확신을 비롯한 많은 일들을 상대방에게 의지한다.",
  "상대방이 나를 떠나서 많은 시간을 보냈을 때 나는 불쾌하다.",
] as const;

function normalizeAnswerMap(value: unknown): AnswerMap {
  if (!value || typeof value !== "object") return {};
  return Object.entries(value as Record<string, unknown>).reduce<AnswerMap>((acc, [key, raw]) => {
    const no = Number(key);
    const score = Number(raw);
    if (!Number.isFinite(no) || !Number.isFinite(score)) return acc;
    if (score < 1 || score > 5) return acc;
    acc[no] = score;
    return acc;
  }, {});
}

export function AdultAttachmentSheet({ clientId, testSlug }: AdultAttachmentSheetProps) {
  const router = useRouter();
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
    () => ATTACHMENT_QUESTIONS.filter((_, index) => answers[index + 1] != null).length,
    [answers],
  );

  const saveResult = async () => {
    if (!clientId) {
      setSaveState("error");
      setSaveMessage("대상자 정보가 없어 저장할 수 없습니다.");
      return;
    }

    const missing = ATTACHMENT_QUESTIONS.map((_, index) => index + 1).filter((no) => answers[no] == null);
    if (missing.length > 0) {
      setMissingNumbers(missing);
      setSaveState("error");
      setSaveMessage(`미응답 문항 ${missing.length}개가 있습니다.`);
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
            title: "성인애착유형검사",
            answers,
            questions: ATTACHMENT_QUESTIONS,
            scale: SCALE_OPTIONS,
          },
        }),
      });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) throw new Error(payload?.message ?? "저장에 실패했습니다.");
      setSaveState("saved");
      setSaveMessage("검사 결과가 저장되었습니다.");
      if (resultHref) {
        router.push(resultHref);
        router.refresh();
      }
    } catch (error) {
      setSaveState("error");
      setSaveMessage(error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <section className="rounded-xl border border-[#c7d4cc] bg-[#edf3ef] px-4 py-4 text-sm text-[#2f4f46] sm:px-5">
        <p className="font-semibold">✓ 검사 시작 안내문</p>
        <p className="mt-2">
          다음 질문들은 귀하가 다른 사람과의 관계에서 어떻게 느끼는지를 알아보기 위한 것입니다.
          가까운 정도에 따라 표시를 해주시기 바랍니다.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>현재 자신이 가장 일상적이고 자연스럽게 느끼는 관계 패턴을 떠올리며 응답해주세요.</li>
          <li>너무 깊게 고민하지 마시고, 처음 읽었을 때 직관적으로 떠오르는 느낌에 체크하세요.</li>
        </ul>
      </section>

      <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white">
        <table className="min-w-[1120px] w-full table-fixed border-collapse text-xs sm:text-sm">
          <colgroup>
            <col className="w-16" />
            <col />
            <col className="w-28" />
            <col className="w-28" />
            <col className="w-28" />
            <col className="w-28" />
            <col className="w-28" />
          </colgroup>
          <thead className="bg-slate-100 text-slate-900">
            <tr>
              <th className="border border-slate-300 px-2 py-2 text-center font-semibold">번호</th>
              <th className="border border-slate-300 px-2 py-2 text-left font-semibold">내용</th>
              {SCALE_OPTIONS.map((option) => (
                <th key={option.value} className="border border-slate-300 px-2 py-2 text-center font-semibold">
                  {option.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ATTACHMENT_QUESTIONS.map((question, index) => {
              const no = index + 1;
              return (
                <tr
                  key={no}
                  className={`odd:bg-white even:bg-slate-50 ${
                    missingNumbers.includes(no) ? "bg-rose-50" : ""
                  }`}
                >
                  <td className="border border-slate-200 px-2 py-2 text-center">{no}</td>
                  <td className="border border-slate-200 px-2 py-2">{question}</td>
                  {SCALE_OPTIONS.map((option) => (
                    <td key={option.value} className="border border-slate-200 px-2 py-2 text-center">
                      <input
                        type="radio"
                        name={`attachment-${no}`}
                        value={option.value}
                        checked={answers[no] === option.value}
                        onChange={() => {
                          setAnswers((prev) => ({ ...prev, [no]: option.value }));
                          setMissingNumbers((prev) => prev.filter((value) => value !== no));
                        }}
                        className="h-4 w-4 accent-[#2f4f46]"
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
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
            응답 {answeredCount} / {ATTACHMENT_QUESTIONS.length}
          </p>
        </div>
        {missingNumbers.length > 0 ? (
          <p className="mt-2 text-xs text-rose-600">미응답 번호: {missingNumbers.join(", ")}</p>
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
