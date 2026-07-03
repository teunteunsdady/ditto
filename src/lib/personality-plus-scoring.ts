export const PERSONALITY_PLUS_SECTION_TYPE_ORDER = [8, 9, 1, 2, 3, 4, 5, 6, 7] as const;
export const PERSONALITY_PLUS_QUESTIONS_PER_SECTION = 11;
export const PERSONALITY_PLUS_SCORED_PER_SECTION = 10;
export const PERSONALITY_PLUS_TOTAL_QUESTIONS =
  PERSONALITY_PLUS_SECTION_TYPE_ORDER.length * PERSONALITY_PLUS_QUESTIONS_PER_SECTION;

export type PersonalityPlusScaleMode = "new" | "legacy4" | "legacy5";

export type PersonalityPlusTypeScore = {
  typeNo: number;
  score: number;
  sectionIndex: number;
};

type ScaleOptionLike = { value?: unknown };

export function detectPersonalityPlusScaleMode(scale: unknown): PersonalityPlusScaleMode {
  if (!Array.isArray(scale)) return "new";
  const values = scale
    .map((item) => (item && typeof item === "object" ? Number((item as ScaleOptionLike).value) : NaN))
    .filter((num) => Number.isFinite(num));
  if (values.length === 0) return "new";

  const uniq = new Set(values);
  if (uniq.has(-2) || uniq.has(-1) || uniq.has(0) || uniq.has(1) || uniq.has(2)) {
    return "new";
  }
  if ([1, 2, 3, 4].every((value) => uniq.has(value))) return "legacy4";
  if ([1, 2, 3, 4, 5].every((value) => uniq.has(value))) return "legacy5";
  return "new";
}

export function normalizePersonalityPlusScore(
  raw: number,
  mode: PersonalityPlusScaleMode,
): number {
  if (mode === "legacy4") {
    if (raw === 1) return -2;
    if (raw === 2) return -1;
    if (raw === 3) return 1;
    if (raw === 4) return 2;
    return 0;
  }
  if (mode === "legacy5") {
    if (raw < 1 || raw > 5) return 0;
    return raw - 3;
  }
  return raw;
}

export function isPersonalityPlusScoredQuestion(questionNo: number): boolean {
  if (!Number.isFinite(questionNo) || questionNo <= 0) return false;
  // 섹션당 11문항 중 11번째(※ 분별 문항)는 채점에서 제외
  return questionNo % PERSONALITY_PLUS_QUESTIONS_PER_SECTION !== 0;
}

export function normalizePersonalityPlusAnswers(
  value: unknown,
  scale: unknown,
): Record<number, number> {
  if (!value || typeof value !== "object") return {};
  const scaleMode = detectPersonalityPlusScaleMode(scale);
  return Object.entries(value as Record<string, unknown>).reduce<Record<number, number>>(
    (acc, [key, raw]) => {
      const no = Number(key);
      const score = normalizePersonalityPlusScore(Number(raw), scaleMode);
      if (!Number.isFinite(no) || !Number.isFinite(score)) return acc;
      if (score < -2 || score > 2) return acc;
      acc[no] = score;
      return acc;
    },
    {},
  );
}

/** 섹션(11문항 블록) 순서 → 8,9,1,2,3,4,5,6,7 유형 점수 합산 */
export function computePersonalityPlusTypeScores(
  answers: Record<number, number>,
): PersonalityPlusTypeScore[] {
  return PERSONALITY_PLUS_SECTION_TYPE_ORDER.map((typeNo, sectionIdx) => {
    const start = sectionIdx * PERSONALITY_PLUS_QUESTIONS_PER_SECTION + 1;
    const end = start + PERSONALITY_PLUS_QUESTIONS_PER_SECTION - 1;
    const score = Array.from({ length: end - start + 1 }, (_, offset) => start + offset).reduce(
      (acc, questionNo) =>
        isPersonalityPlusScoredQuestion(questionNo) ? acc + (answers[questionNo] ?? 0) : acc,
      0,
    );

    return {
      typeNo,
      score,
      sectionIndex: sectionIdx + 1,
    };
  });
}

export function buildPersonalityPlusTypeScoresFromResultData(resultData: {
  answers?: unknown;
  scale?: unknown;
}): PersonalityPlusTypeScore[] {
  const answers = normalizePersonalityPlusAnswers(resultData.answers, resultData.scale);
  return computePersonalityPlusTypeScores(answers);
}

/** 그래프/점수표 표시용: 유형 번호 1→9 순서 */
export function orderPersonalityPlusTypeScoresForDisplay(
  scores: PersonalityPlusTypeScore[],
): PersonalityPlusTypeScore[] {
  return [...scores].sort((a, b) => a.typeNo - b.typeNo);
}
