export type CurriculumTest = {
  order: number;
  slug: string;
  title: string;
  description: string;
};

export const CURRICULUM_TESTS: CurriculumTest[] = [
  { order: 1, slug: "shape-6", title: "6도형 검사", description: "심층 상황 파악" },
  { order: 2, slug: "life-graph", title: "인생그래프", description: "삶의 궤적 시각화" },
  { order: 3, slug: "personality", title: "성격유형 검사", description: "성격 유형 분석" },
  {
    order: 4,
    slug: "personality-plus",
    title: "성격유형 검사(심화)",
    description: "성격 유형 심화 분석",
  },
  {
    order: 5,
    slug: "attachment",
    title: "애착유형 검사",
    description: "대인관계 패턴 및 정서적 유대 분석",
  },
  { order: 6, slug: "core-emotion", title: "핵심감정 검사", description: "내면 감정 파악" },
];
