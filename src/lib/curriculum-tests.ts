export type CurriculumTest = {
  order: number;
  slug: string;
  title: string;
  description: string;
};

export const CURRICULUM_TESTS: CurriculumTest[] = [
  {
    order: 1,
    slug: "personality-plus",
    title: "성격유형검사 (심화)",
    description: "성향 패턴과 반응 스타일을 입체적으로 파악",
  },
  {
    order: 2,
    slug: "attachment",
    title: "애착유형검사",
    description: "관계 맺기 방식과 정서적 안정 패턴 확인",
  },
  {
    order: 3,
    slug: "core-emotion",
    title: "핵심감정 검사",
    description: "자주 활성화되는 핵심 감정 신호 탐색",
  },
  { order: 4, slug: "htp", title: "HTP", description: "그리기 기반 투사 검사" },
  { order: 5, slug: "life-graph", title: "인생그래프", description: "삶의 궤적 시각화" },
  {
    order: 6,
    slug: "sentence-completion",
    title: "문장완성검사",
    description: "미완성 문장을 통한 인식/정서 패턴 확인",
  },
];
