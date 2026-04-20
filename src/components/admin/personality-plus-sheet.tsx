"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";

type PersonalityPlusSheetProps = {
  clientId?: string;
  testSlug: string;
};

type AnswerMap = Record<number, number>;

type QuestionRow = {
  id: number;
  section: number;
  displayNo: string;
  text: string;
};

const SCALE_OPTIONS = [
  { value: 4, label: "매우 그렇다" },
  { value: 3, label: "그렇다" },
  { value: 2, label: "아니다" },
  { value: 1, label: "전혀 아니다" },
] as const;

const QUESTIONS_BY_SECTION: string[][] = [
  [
    "나는 모임이나 팀에서 자연스럽게 주도권을 잡는 편이다.",
    "내가 옳다고 생각하면, 누구에게든 솔직하게 말한다.",
    "갈등이 생기면 피하지 않고 직접 부딪친다.",
    "어떤 상황에서도 빠르고 단호하게 결정하려 한다.",
    "억울하거나 부당하다고 느끼면 바로 강하게 반응한다.",
    "규칙이나 권위가 나를 억누른다고 느끼면 거부감과 반발심이 올라온다.",
    "누군가 나를 지배하거나 얕보려 하면 강하게 맞선다.",
    "힘들거나 두려워도 겉으로는 강한 모습만 보인다.",
    "약한 모습을 드러내면 불리해질까 걱정된다.",
    "나는 강해야 안전하다고 느낀다.",
    "힘을 드러내지 않아도 괜찮다고 느낀다.",
  ],
  [
    "나는 갈등을 만들지 않기 위해 내 의견을 숨기는 편이다.",
    "새로운 일을 시작해야 할 때, 미루거나 늦출 때가 많다.",
    "대화에서 내 주장보다 상대방의 의견을 따르는 편이다.",
    "선택해야 할 상황이 오면, 결정을 쉽게 내리지 못한다.",
    "일이 많아지면 힘든 것보다 먼저 피곤하고 무기력해진다.",
    "나는 지금 하고 있는 방식이나 익숙한 생활을 유지하려 한다.",
    "중요한 상황에서도 내 의지보다는 타인의 요구를 먼저 고려한다.",
    "내 욕구나 바람을 무시하고 지내는 경우가 많다.",
    "겉으로는 순응하지만, 속으로는 내 생각을 바꾸지 않을 때가 있다.",
    "나는 갈등이 없고 평화로울 때 가장 편안하다.",
    "나는 갈등이 있어도 내 뜻을 바로 밝히는 편이다.",
  ],
  [
    "다른 사람이 규칙을 어기면 화가 나고 그냥 넘기기 힘들다.",
    "작은 실수도 눈에 띄면 그냥 넘어가기 어렵다.",
    "내가 옳다고 생각하면, 상대가 누구든 속으로는 내 생각이 맞다고 확신한다.",
    "일이 완벽하지 않으면 끝난 뒤에도 마음이 불편하다.",
    "해야 할 일을 매사 대충 처리하는 걸 보면 짜증이 나고 지적하고 싶어진다.",
    "애매한 기준이나 불분명한 지시는 나를 답답하게 만든다.",
    "내 의견이 무시되면 억울하고 분노가 올라온다.",
    "화가 나도 겉으로는 차분한 척 하려고 애쓴다.",
    "남을 비판하면서도 동시에 스스로를 강하게 책망한다.",
    "무언가를 바르고 정확하게 해야 마음이 놓인다.",
    "틀린 부분이 보여도 굳이 신경 쓰지 않고 넘어가는 편이다.",
  ],
  [
    "나는 다른 사람의 부탁을 거절하기가 쉽지 않다.",
    "내가 힘들어도, 부탁을 받으면 웬만하면 들어준다.",
    "상대가 원하는 걸 눈치 채고 먼저 챙겨주려는 편이다.",
    "내 일이 급해도 주변 사람의 필요를 먼저 챙길 때가 많다.",
    "내가 도운 일이 고맙다는 말 없이 넘어가면 서운하다.",
    "가까운 사람이 나를 필요로 하지 않으면 소외된 것처럼 느껴진다.",
    "사람들이 내 노력을 알아주지 않으면 억울하다.",
    "내 욕구를 숨기고 괜찮은 척하면서 남을 챙길 때가 있다.",
    "힘들어도 관계를 잃지 않으려고 오히려 더 친절하게 군다.",
    "나는 사랑받고 다른 사람에게 꼭 필요하다고 느낄 때 안정감을 느낀다.",
    "나는 다른 사람의 인정과 상관없이 내 욕구를 먼저 챙길 수 있다.",
  ],
  [
    "분명한 목표와 성과 기준이 있어야 집중과 의욕이 생긴다.",
    "어떤 일이든 빠르고 효율적으로 결과를 내는 것이 우선이다.",
    "내가 성취한 결과를 보여주고 인정받을 때 가장 큰 만족을 느낀다.",
    "성과로 이어지지 않는 활동은 시간 낭비라고 느껴 피한다.",
    "다른 사람보다 뒤처지는 순간을 견디기 힘들다.",
    "사람들에게 능력 있고 성공적인 모습으로 보이려 신경 쓴다.",
    "성과가 없으면 내 가치도 함께 떨어지는 것처럼 느껴진다.",
    "힘들어도 괜찮은 척하며 계속 성과를 내려고 한다.",
    "실패나 약점은 드러내지 않고 감추려 한다.",
    "나는 인정받고 성취를 이뤄야 마음이 편하다.",
    "성과가 없어도 내 가치는 충분하다고 느낀다.",
  ],
  [
    "작은 감정 변화도 하루 전체를 흔들어 놓을 때가 많다.",
    "나는 다른 사람과 똑같아 보이는 걸 불편하게 느낀다.",
    "감정이 크게 올라오면, 한동안 다른 일에 집중하기 힘들다.",
    "다른 사람과 비교하면, 괜히 나만 부족해 보일 때가 많다.",
    "내 개성과 취향을 드러내야 진짜 나 자신 같다고 느낀다.",
    "상실이나 아쉬움이 있으면, 며칠 동안 그 감정에서 벗어나기 어렵다.",
    "특별히 잘하는 게 없다고 느낄 때, 내 존재 의미까지 흔들린다.",
    "누군가 기분이 안좋으면, 나도 덩달아 기분이 가라앉아 다른 일에 집중하기 어렵다.",
    "겉으로는 괜찮은 척하지만, 속으로는 정반대 감정을 품을 때가 많다.",
    "나는 특별하고 의미 있는 존재여야 편안하다.",
    "평범하게 살아도 충분히 괜찮다고 느낀다.",
  ],
  [
    "나는 동아리나 수업에서 말하기보다 관찰하며 듣는 편이다.",
    "친한 친구와도 일정한 거리를 두어야 편하다.",
    "과제를 시작할 때, 실행보다 자료부터 찾는다.",
    "내가 잘 아는 과목에 대해서는 내 의견을 강하게 주장한다.",
    "확실하지 않으면 결정을 미루고 더 알아보려 한다.",
    "해결해야 할 문제가 생기면, 도움을 청하기보다 혼자 해결하려 한다.",
    "새로운 것보다 익숙한 취미 활동이 더 편하다.",
    "스트레스를 받으면, 사람들보다 책 유튜브에 더 몰두한다.",
    "내가 모르는 게 드러날까 두려워 발언을 피한다.",
    "나는 지식을 쌓아야 불안이 줄어든다.",
    "나는 준비가 덜 되었어도 내 생각을 바로 말한다.",
  ],
  [
    "나는 친구를 믿지만, 동시에 의심이 스칠 때가 있다.",
    "해야 할 일을 할 때, 안심이 될 때까지 여러 번 점검한다.",
    "내가 속한 조직이나 모임에서 누군가 방향을 정해주면 마음이 놓인다.",
    "상황이 불확실하면, 위험이 상상되고 결정도 늦어진다.",
    "어떤 일을 할 때, 잘 될 가능성보다 잘 안 될 가능성이 더 크게 다가온다.",
    "규칙이나 기준이 있으면 마음이 덜 불안하다.",
    "중요한 사람의 말이나 약속은 다시 확인하고 싶어진다.",
    "내 불안감이 주위 환경과 사람들 때문이라고 느낄 때가 있다.",
    "누군가를 신뢰하면서도, 혹시 모를 상황에 대비하자는 마음이 든다.",
    "나는 믿고 의지할 사람이나 기준이 있어야 편안하다.",
    "나는 불확실해도 의심하지 않고 바로 믿는다.",
  ],
  [
    "나는 여러 지인들과 어울려야 에너지가 살아난다.",
    "새로운 활동을 보면 해보고 싶고 가벼운 마음으로 도전해 본다.",
    "지루함을 견디기 힘들어해서 금세 다른 자극을 찾게 된다.",
    "사람들과 대화할 때 유머를 섞어 분위기를 밝게 만들려 한다.",
    "중요한 결정을 내릴 때 여러 가능성을 동시에 생각한다.",
    "불안하거나 힘든 상황이 닥치면, 끝까지 직면하기보다 기분이 좋아지는 선택을 먼저 한다.",
    "새로운 경험과 변화를 계속 찾아다니는 편이다.",
    "실패가 분명한 상황에서도, '괜찮아 곧 좋아질 거야'라며 낙관적인 결론을 낸다.",
    "어려운 상황에 몰두하기보다, 다른 흥미로운 생각이나 활동으로 관심을 돌린다.",
    "나는 즐거움을 추구해야 안전하다고 느낀다.",
    "힘들고 불편해도 끝까지 버티며 마무리한다.",
  ],
];

const QUESTIONS: QuestionRow[] = QUESTIONS_BY_SECTION.flatMap((sectionQuestions, sectionIdx) =>
  sectionQuestions.map((text, idx) => ({
    id: sectionIdx * 11 + idx + 1,
    section: sectionIdx + 1,
    displayNo: idx === 10 ? "※" : String(idx + 1),
    text,
  })),
);

function normalizeAnswerMap(value: unknown): AnswerMap {
  if (!value || typeof value !== "object") return {};
  return Object.entries(value as Record<string, unknown>).reduce<AnswerMap>((acc, [key, raw]) => {
    const no = Number(key);
    const score = Number(raw);
    if (!Number.isFinite(no) || !Number.isFinite(score)) return acc;
    acc[no] = score;
    return acc;
  }, {});
}

export function PersonalityPlusSheet({ clientId, testSlug }: PersonalityPlusSheetProps) {
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
    () => QUESTIONS.filter((question) => answers[question.id] != null).length,
    [answers],
  );

  const saveResult = async () => {
    if (!clientId) {
      setSaveState("error");
      setSaveMessage("대상자 정보가 없어 저장할 수 없습니다.");
      return;
    }

    const missing = QUESTIONS.filter((question) => answers[question.id] == null).map(
      (question) => question.id,
    );
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
            answers,
            questions: QUESTIONS.map((question) => `${question.displayNo} ${question.text}`),
            scale: SCALE_OPTIONS,
            meta: {
              title: "성격유형검사 (심화)",
              sections: QUESTIONS_BY_SECTION.length,
            },
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
    <div className="mt-6 space-y-4">
      <section className="rounded-xl border border-[#c7d4cc] bg-[#edf3ef] px-4 py-4 text-sm text-[#2f4f46] sm:px-5">
        <p className="font-semibold">✓ 검사 시작 안내문</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>17세~19세 사춘기 시절, 마음이 편안했던 시기의 나를 떠올리세요.</li>
          <li>시험/군대/직장 적응으로 바뀐 모습이 아니라, 본래의 나를 기준으로 합니다.</li>
          <li>배워서 익힌 행동이 아니라, 원래 성향을 체크하세요.</li>
          <li>원하는 이상적인 모습이 아니라, 실제 평소 모습을 기준으로 하세요.</li>
        </ul>
      </section>

      <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white">
        <table className="min-w-[880px] w-full table-fixed border-collapse text-xs sm:text-sm">
          <colgroup>
            <col className="w-16" />
            <col />
            <col className="w-24" />
            <col className="w-24" />
            <col className="w-24" />
            <col className="w-24" />
          </colgroup>
          <thead className="bg-slate-100 text-slate-900">
            <tr>
              <th className="border border-slate-300 px-3 py-2 text-center font-semibold">번호</th>
              <th className="border border-slate-300 px-3 py-2 text-left font-semibold">문항</th>
              {SCALE_OPTIONS.map((option) => (
                <th
                  key={option.value}
                  className="border border-slate-300 px-2 py-2 text-center font-semibold"
                >
                  {option.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {QUESTIONS.map((question, index) => {
              const isSectionStart = index === 0 || question.section !== QUESTIONS[index - 1]?.section;
              return (
                <Fragment key={question.id}>
                  {isSectionStart ? (
                    <tr className="bg-slate-50">
                      <td colSpan={6} className="border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">
                        섹션 {question.section}
                      </td>
                    </tr>
                  ) : null}
                  <tr
                    className={`odd:bg-white even:bg-slate-50 ${
                      missingNumbers.includes(question.id) ? "bg-rose-50" : ""
                    }`}
                  >
                    <td className="border border-slate-200 px-3 py-2 text-center">{question.displayNo}</td>
                    <td className="border border-slate-200 px-3 py-2">{question.text}</td>
                    {SCALE_OPTIONS.map((option) => (
                      <td
                        key={`${question.id}-${option.value}`}
                        className="border border-slate-200 px-2 py-2 text-center"
                      >
                        <input
                          type="radio"
                          name={`personality-plus-${question.id}`}
                          value={option.value}
                          checked={answers[question.id] === option.value}
                          onChange={() => {
                            setAnswers((prev) => ({ ...prev, [question.id]: option.value }));
                            setMissingNumbers((prev) => prev.filter((value) => value !== question.id));
                          }}
                          className="h-4 w-4 accent-[#2f4f46]"
                        />
                      </td>
                    ))}
                  </tr>
                </Fragment>
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
            응답 {answeredCount} / {QUESTIONS.length}
          </p>
        </div>
        {missingNumbers.length > 0 ? (
          <p className="mt-2 text-xs text-rose-600">
            미응답 문항 수: {missingNumbers.length}
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
