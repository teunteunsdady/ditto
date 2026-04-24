export const CORE_EMOTION_TYPE_NAMES = [
  "부담감",
  "경쟁심",
  "열등감",
  "억울함",
  "슬픔",
  "적개심",
  "외로움",
  "그리움",
  "질투",
  "두려움",
  "화",
  "무기력",
  "허무",
  "불안",
  "공포",
  "소외",
] as const;

export function getCoreEmotionTypeName(typeNo: number) {
  return CORE_EMOTION_TYPE_NAMES[typeNo - 1] ?? `감정 유형 ${typeNo}`;
}

