"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type CoreEmotionSheetProps = {
  clientId?: string;
  testSlug: string;
};

type EmotionItem = {
  text: string;
  checked: boolean;
};

type EmotionCategory = {
  name: string;
  items: EmotionItem[];
};

type EmotionType = {
  typeNo: number;
  categories: EmotionCategory[];
};

const CATEGORY_NAMES = ["대인관계", "가족관계", "일과 공부", "나의 감정"] as const;
const CORE_EMOTION_ITEMS: string[][][] = [
  [
    ["위축되어 있다", "거절을 못 한다", "긴장되어 있다", "요구를 못 한다"],
    ["늘 지쳐있다", "눈치 보게 한다", "집에서는 파 김치다", "함께 자리하기를 피한다"],
    ["잘 하려고 한다", "혼자 다 한다", "할 일이 산더미 같이 쌓여있다"],
    ["열심히 산다", "든든하다", "말은 바를 다한다"],
  ],
  [
    ["이기려고 한다", "지고는 못 산다", "조급하다", "전투적이다"],
    ["비교를 잘 한다", "무시한다", "표현이 자극적이다", "경쟁 상대로 본다"],
    ["1등이 되어야 한다", "이기는 데만 집중한다", "상대가 있으면 더 잘한다", "사소한 일에 목숨 건다"],
    ["집중력이 있다", "포기하지 않는다", "성공지향적이다"],
  ],
  [
    ["남의 탓을 잘한다", "건드리면 터진다", "권위에 반항적이다", "자존감이 낮고, 잘 상처 받는다"],
    ["조정하려 한다", "지배하려 한다", "책임지려 한다", "인정 안 해주면 화를 낸다"],
    ["확실하다", "장·단점 파악을 잘한다", "조직관리 능력이 있다"],
    ["의리있다", "정의감이 있다", "설득을 잘 한다"],
  ],
  [
    ["소심하다", "기가 죽어있다", "경쟁적이다", "인정받으려고 애쓴다"],
    ["비난한다", "헌신적이다", "마음에 안들어 한다", "잘 하도록 부추긴다"],
    ["자책한다", "책임감이 있다", "잘하려고 기를 쓴다", "쉽게 포기한다"],
    ["자기 자신을 잘 안다", "반성능력이 있다", "비교분석을 잘 한다", "끊임없이 자기개발을 한다"],
  ],
  [
    ["사람을 좋아한다", "의존적이다", "혼자 있고 싶어한다", "함께하고 싶어한다"],
    ["의사소통이 일방적이다", "밖으로 돈다", "상처 줄까봐 화 못낸다", "은근슬쩍 상대방이 하게 한다"],
    ["시작을 잘 한다", "혼자서 한다", "변화를 놓고 미루려 안한다"],
    ["무사태평이다", "주관이 뚜렷하다", "현재의 삶을 즐긴다", "다른 사람을 편안하게 해준다"],
  ],
  [
    ["애잔하다", "살갑다", "친절하다", "미련이 많다"],
    ["걱정이 많다", "간섭이 많다", "다정다감하다"],
    ["우유부단하다", "이상주의적이다", "일에 애정이 많다", "자기것을 잘 챙긴다"],
    ["감수성이 풍부하다", "대화를 즐긴다", "사람을 잘 챙긴다", "마당발이다"],
  ],
  [
    ["쉽게 토라진다", "셈이 많다", "잘난체 하는 꼴을 못본다", "공주병, 왕자병이 있다"],
    ["친밀하고 싶어한다", "\"놀아줘\"", "나만 바라봐주기 바란다", "0순위 이기를 바란다"],
    ["나만 잘하면 된다", "쌤통이다", "최고가 되려고 한다", "다른 사람을 인정하지 않는다"],
    ["자존심이 있다", "잘 났다", "감정을 잘 알아차린다", "감수성이 예민하다"],
  ],
  [
    ["눈치본다", "조심스럽다", "다가가지 못한다", "자기 주장이 약하다"],
    ["엄격하게 대한다", "편하게 대하지 못한다", "두려움 때문에 화를 잘 낸다"],
    ["실패를 두려워 한다", "시간이 걸린다", "시작하는 것이 힘들다", "혼자서 끙끙댄다", "상대방의 평가에 민감하다"],
    ["안전빵이다", "노력한다", "끈기가 있다", "예의 바르다"],
  ],
  [
    ["상처를 잘 준다", "예민하다", "관계가 힘들다", "화를 참는다"],
    ["성질을 부린다", "짜증낸다", "잘 삐진다", "긴장감을 느끼게 한다"],
    ["시원하게 한다", "홧김에 저지른다", "갈등을 일으킨다", "일에 화풀이가 있다"],
    ["추진력이 있다", "에너지가 많다", "뒤끝이 없다"],
  ],
  [
    ["관계 불감증", "자주 잠수탄다", "신경쓰이게 만든다", "매사가 귀찮다"],
    ["표현을 못 한다", "자신에게 화가 난다", "답답하게 만든다", "천불나게 한다"],
    ["멍하다", "결과물이 없다", "업두가 안 난다", "잠 속으로 피한다"],
    ["경제적이다", "무리하지 않는다", "겸손하다", "엄청난 잠재력이 있다"],
  ],
  [
    ["썰렁하게 한다", "무의미하게 만든다", "초월한 척 한다", "힘빠지게 한다"],
    ["힘들게 한다", "허기지게 한다", "왕따 당한다"],
    ["의욕이 없다", "흥미가 없다", "게으르다"],
    ["경계가 없다", "욕심이 없다", "초연하다", "수용력이 있다"],
  ],
  [
    ["사라지고 싶다", "조용하다", "기대에 부응하려고 애쓴다", "공평하게 안 대하면 슬퍼진다"],
    ["\"기쁨조\"이다", "\"미안해\"를 입에 달고 산다", "감정을 꾹꾹 누른다", "필요한 존재가 되려고 노력한다"],
    ["헌신적으로 한다", "열심히 한다", "실망시키지 않으려고 노력한다"],
    ["알아서 잘한다", "꺼이꺼이 잘 운다", "다른 사람의 심정을 잘 헤아린다"],
  ],
  [
    ["노심초사 한다", "망설인다", "전전긍긍한다", "안절부절 한다"],
    ["잔소리가 많다", "강박적이다", "통제하려고 한다", "확인전화를 자주 한다"],
    ["완벽하게 준비한다", "깔끔하다", "철저하게 계획한다"],
    ["순발력이 있다", "열정적이다", "분위기 메이커다", "솔직하고 투명하다", "세세하게 표현한다"],
  ],
  [
    ["속으로는 떨고있다", "\"죽기살기\" 심정이다", "위험을 느낄 때 친구로 만든다", "자기를 보호하기 위해 거리를 둔다"],
    ["냉랭하게 대한다", "장난끼가 있다", "천진난만하다", "공포 분위기를 조성한다"],
    ["빈틈없다", "꼼꼼하다", "끝장을 본다", "한 순간도 놓치지 않는다"],
    ["창조적이다", "여리다", "속내가 따뜻하다", "리더십이 있다", "상상력과 아이디어가 풍부하다"],
  ],
  [
    ["거리를 둔다", "단짝을 만든다", "무관심한 척 한다", "먼저 다가와주길 기다린다"],
    ["소원한다", "적막하다", "무미건조하다"],
    ["시도가 어렵다", "완벽하게 하려 한다", "비난을 두려워한다", "제대로 하려고 노력한다"],
    ["완벽하다", "끈끈하다", "집중력이 있다", "노골적으로 관심을 보인다"],
  ],
  [
    ["초긴장 상태다", "공격적이다", "아군 아니면 적군이다", "아군은 별로 없다", "적개심을 드러내기 두려워 외면한다"],
    ["씁쓸하다", "삭막하다", "감정표현이 극단적이다"],
    ["실패는 죽음이다", "죽기 살기로 한다", "내가 죽든지 네가 죽든지 해보자는 심정이다"],
    ["\"올인\"한다", "목표 지향적이다", "위기대처 능력이 있다"],
  ],
];
function createInitialTypes(): EmotionType[] {
  return CORE_EMOTION_ITEMS.map((typeItems, typeIdx) => ({
    typeNo: typeIdx + 1,
    categories: CATEGORY_NAMES.map((name, categoryIdx) => ({
      name,
      items: (typeItems[categoryIdx] ?? []).map((text) => ({
        text,
        checked: false,
      })),
    })),
  }));
}

function normalizeTypes(value: unknown): EmotionType[] {
  const fallback = createInitialTypes();
  if (!Array.isArray(value)) return fallback;

  return fallback.map((baseType, typeIdx) => {
    const rawType = value[typeIdx];
    if (!rawType || typeof rawType !== "object") return baseType;
    const rawCategories = (rawType as { categories?: unknown }).categories;
    if (!Array.isArray(rawCategories)) return baseType;

    const categories = baseType.categories.map((baseCategory, categoryIdx) => {
      const rawCategory = rawCategories[categoryIdx];
      if (!rawCategory || typeof rawCategory !== "object") return baseCategory;
      const rawItems = (rawCategory as { items?: unknown }).items;
      if (!Array.isArray(rawItems)) return baseCategory;

      const items = baseCategory.items.map((baseItem, itemIdx) => {
        const rawItem = rawItems[itemIdx];
        if (!rawItem || typeof rawItem !== "object") return baseItem;
        const casted = rawItem as { text?: unknown; checked?: unknown };
        return {
          text: typeof casted.text === "string" ? casted.text : "",
          checked: typeof casted.checked === "boolean" ? casted.checked : false,
        };
      });

      return {
        name: baseCategory.name,
        items,
      };
    });

    return {
      typeNo: baseType.typeNo,
      categories,
    };
  });
}

export function CoreEmotionSheet({ clientId, testSlug }: CoreEmotionSheetProps) {
  const [types, setTypes] = useState<EmotionType[]>(() => createInitialTypes());
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");
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
          | { item?: { resultData?: { types?: unknown } | null } | null }
          | null;
        if (!response.ok || !payload?.item?.resultData) return;
        setTypes(normalizeTypes(payload.item.resultData.types));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    };

    void loadSavedResult();
    return () => controller.abort();
  }, [clientId, testSlug]);

  const checkedCount = useMemo(
    () =>
      types.reduce(
        (acc, type) =>
          acc +
          type.categories.reduce(
            (categoryAcc, category) =>
              categoryAcc + category.items.filter((item) => item.checked).length,
            0,
          ),
        0,
      ),
    [types],
  );

  const totalCount = useMemo(
    () =>
      types.reduce(
        (acc, type) =>
          acc + type.categories.reduce((categoryAcc, category) => categoryAcc + category.items.length, 0),
        0,
      ),
    [types],
  );

  const toggleItemChecked = (typeIdx: number, categoryIdx: number, itemIdx: number) => {
    setTypes((prev) =>
      prev.map((type, tIdx) =>
        tIdx !== typeIdx
          ? type
          : {
              ...type,
              categories: type.categories.map((category, cIdx) =>
                cIdx !== categoryIdx
                  ? category
                  : {
                      ...category,
                      items: category.items.map((item, iIdx) =>
                        iIdx !== itemIdx ? item : { ...item, checked: !item.checked },
                      ),
                    },
              ),
            },
      ),
    );
  };

  const saveResult = async () => {
    if (!clientId) {
      setSaveState("error");
      setSaveMessage("대상자 정보가 없어 저장할 수 없습니다.");
      return;
    }

    setSaveState("saving");
    setSaveMessage("");

    try {
      const response = await fetch(`/api/clients/${clientId}/tests/${testSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resultData: {
            title: "핵심 감정 검사",
            format: "core-emotion-grid",
            types,
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
        <p className="mt-2">
          다음 질문들은 귀하가 다른 사람과의 관계에서 어떻게 느끼는지를 알아보기 위한 것입니다.
          가까운 정도에 따라 표시를 해주시기 바랍니다.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>현재 자신이 가장 일상적이고 자연스럽게 느끼는 관계 패턴을 떠올리며 응답해주세요.</li>
          <li>너무 깊게 고민하지 마시고, 처음 읽었을 때 직관적으로 떠오르는 느낌에 체크하세요.</li>
        </ul>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {types.map((type, typeIdx) => (
          <article
            key={type.typeNo}
            className="rounded-xl border border-slate-300 bg-white p-3 sm:p-4"
          >
            <h3 className="mb-3 text-lg font-semibold text-slate-900">감정 유형 {type.typeNo}</h3>
            <div>
              <table className="w-full table-fixed border-collapse text-xs sm:text-sm">
                <colgroup>
                  <col className="w-20 sm:w-24" />
                  <col />
                </colgroup>
                <thead className="bg-slate-100 text-slate-900">
                  <tr>
                    <th className="border border-slate-300 px-2 py-2 text-left font-semibold">카테고리</th>
                    <th className="border border-slate-300 px-2 py-2 text-left font-semibold">항목</th>
                  </tr>
                </thead>
                <tbody>
                  {type.categories.map((category, categoryIdx) => (
                    <tr key={category.name} className="align-top">
                      <td className="border border-slate-200 px-2 py-2 font-medium text-slate-700">
                        {category.name}
                      </td>
                      <td className="border border-slate-200 px-2 py-2">
                        <div className="space-y-1.5">
                          {category.items.map((item, itemIdx) => (
                            <label key={itemIdx} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={() => toggleItemChecked(typeIdx, categoryIdx, itemIdx)}
                                className="h-4 w-4 accent-[#2f4f46]"
                              />
                              <span className="break-words text-xs text-slate-700 sm:text-sm">
                                {item.text}
                              </span>
                            </label>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        ))}
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
            체크 {checkedCount} / {totalCount}
          </p>
        </div>
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
