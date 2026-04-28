"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, BarChart3, CheckCircle2, Heart, Lightbulb } from "lucide-react";
import { getCoreEmotionTypeName } from "@/lib/core-emotion-types";
import { PERSONALITY_QUESTIONS, PERSONALITY_SCALE_OPTIONS } from "@/lib/personality-questions";

type Point = { x: number; y: number };
type Stroke = {
  id: number;
  points: Point[];
  color: string;
  width: number;
};

type AssessmentResultViewProps = {
  testSlug: string;
  resultData: unknown;
};

type PersonalityScorePoint = {
  typeNo: number;
  score: number;
};

type PersonalityTypeProfile = {
  name: string;
  subtitle: string;
  core: string;
  desire: string;
  fear: string;
  keywords: string[];
  healthyState: string[];
  unhealthyState: string[];
  strengths: string[];
  weaknesses: string[];
};

const PERSONALITY_PLUS_TYPE_PROFILES: Record<number, PersonalityTypeProfile> = {
  1: {
    name: "개혁가",
    subtitle: "원칙주의자",
    core: "옳고 바르게 살아야 한다는 기준이 분명합니다.",
    desire: "완전함, 정직함, 도덕적 일관성",
    fear: "결함이 있거나 잘못된 사람으로 보이는 것",
    keywords: ["원칙", "개선", "책임", "정확성"],
    healthyState: ["기준이 명확하고 공정하게 판단한다.", "실수를 개선하며 성장의 방향을 제시한다."],
    unhealthyState: ["비판과 통제가 늘어나 관계가 경직된다.", "작은 오류에도 과도하게 예민해진다."],
    strengths: ["높은 책임감과 성실함", "일관된 기준으로 품질을 끌어올림", "자기관리와 절제력"],
    weaknesses: ["완벽주의로 인한 피로 누적", "융통성 부족", "타인/자기 비난 증가"],
  },
  2: {
    name: "조력가",
    subtitle: "헌신주의자",
    core: "타인을 돌보며 관계 속에서 의미를 찾습니다.",
    desire: "사랑받고 필요로 여겨지는 것",
    fear: "거절당하거나 가치 없는 존재가 되는 것",
    keywords: ["배려", "관계", "헌신", "따뜻함"],
    healthyState: ["공감과 돌봄으로 관계를 안정시킨다.", "필요한 도움을 적절한 방식으로 제공한다."],
    unhealthyState: ["인정 욕구가 커지며 서운함이 쌓인다.", "경계를 넘는 과도한 개입이 늘어난다."],
    strengths: ["높은 공감 능력", "관계 형성력", "협력 분위기 조성"],
    weaknesses: ["자기 욕구 억압", "거절의 어려움", "감정적 소진"],
  },
  3: {
    name: "성취가",
    subtitle: "성과주의자",
    core: "목표를 달성하고 유능함을 증명하려는 동기가 큽니다.",
    desire: "성공, 인정, 효율",
    fear: "실패하거나 무가치하다는 평가",
    keywords: ["목표", "성과", "효율", "추진력"],
    healthyState: ["목표 달성을 위해 팀을 효과적으로 이끈다.", "현실적인 실행 계획을 빠르게 만든다."],
    unhealthyState: ["성과 중심으로 관계가 도구화된다.", "실패 회피로 진짜 감정을 숨긴다."],
    strengths: ["강한 실행력", "명확한 목표 설정", "결과 중심의 문제해결"],
    weaknesses: ["과도한 경쟁심", "이미지 관리 스트레스", "감정 단절"],
  },
  4: {
    name: "개인주의자",
    subtitle: "낭만주의자",
    core: "자신만의 정체성과 감정의 진정성을 중요하게 여깁니다.",
    desire: "독특하고 진짜인 나로 살아가는 것",
    fear: "평범하고 의미 없는 존재가 되는 것",
    keywords: ["독창성", "감수성", "심미안", "진정성"],
    healthyState: ["깊은 감수성과 유연함으로 타인을 이해한다.", "창조적 아이디어로 관계와 일을 풍성하게 만든다."],
    unhealthyState: ["자의식이 강해지며 감정의 기복이 커진다.", "비교와 결핍감으로 자신을 과소평가한다."],
    strengths: ["감정 인식 능력", "창의력과 표현력", "깊이 있는 공감"],
    weaknesses: ["감정 기복", "관계 과해석", "실행 지연"],
  },
  5: {
    name: "탐구가",
    subtitle: "관찰주의자",
    core: "이해와 통찰을 통해 안전을 확보하려는 경향이 있습니다.",
    desire: "유능함, 독립성, 지식",
    fear: "무능하거나 침해당하는 것",
    keywords: ["분석", "탐구", "거리두기", "통찰"],
    healthyState: ["복잡한 문제를 구조적으로 정리한다.", "핵심 정보를 기반으로 합리적 판단을 내린다."],
    unhealthyState: ["과도한 거리두기로 협업이 약해진다.", "준비에만 머물며 실행이 느려진다."],
    strengths: ["논리적 사고", "깊이 있는 분석", "지식 축적"],
    weaknesses: ["정서적 표현 부족", "고립 경향", "행동 지연"],
  },
  6: {
    name: "충성가",
    subtitle: "안전추구형",
    core: "불확실성을 관리하며 신뢰 가능한 기준을 찾습니다.",
    desire: "안전, 신뢰, 예측 가능성",
    fear: "버려지거나 보호받지 못하는 것",
    keywords: ["책임", "신중함", "점검", "충성"],
    healthyState: ["리스크를 선제적으로 점검한다.", "팀의 신뢰 체계를 견고하게 만든다."],
    unhealthyState: ["의심과 불안이 커져 결정이 느려진다.", "확인을 반복하며 에너지가 소모된다."],
    strengths: ["위기 대응력", "높은 책임감", "성실한 준비성"],
    weaknesses: ["걱정 과잉", "결정 회피", "자기신뢰 저하"],
  },
  7: {
    name: "열정가",
    subtitle: "낙천주의자",
    core: "새로운 가능성과 즐거움을 통해 활력을 얻습니다.",
    desire: "자유, 즐거움, 다양한 경험",
    fear: "고통에 갇히거나 선택지가 사라지는 것",
    keywords: ["확장", "낙관", "도전", "아이디어"],
    healthyState: ["긍정 에너지로 팀의 동력을 높인다.", "다양한 가능성을 빠르게 연결한다."],
    unhealthyState: ["집중력이 분산되고 마무리가 약해진다.", "불편한 감정을 회피하려 한다."],
    strengths: ["아이디어 발산", "적응력", "도전 정신"],
    weaknesses: ["산만함", "충동적 선택", "지속성 부족"],
  },
  8: {
    name: "도전가",
    subtitle: "보호자형 리더",
    core: "강한 의지와 영향력으로 상황을 주도하려는 경향이 있습니다.",
    desire: "자율성, 통제감, 강인함",
    fear: "약해 보이거나 통제당하는 것",
    keywords: ["결단", "리더십", "직설", "보호"],
    healthyState: ["결단력으로 문제를 빠르게 풀어낸다.", "약자를 보호하고 기준을 세운다."],
    unhealthyState: ["통제 욕구가 강해져 관계가 거칠어진다.", "타협보다 대결을 우선한다."],
    strengths: ["강한 추진력", "책임 있는 리더십", "위기 돌파력"],
    weaknesses: ["직선적 소통", "과한 통제", "감정 완충 부족"],
  },
  9: {
    name: "평화주의자",
    subtitle: "중재자",
    core: "조화와 안정 속에서 편안함을 느낍니다.",
    desire: "평화, 연결감, 안정",
    fear: "갈등으로 인한 단절",
    keywords: ["조화", "수용", "안정", "중재"],
    healthyState: ["다양한 관점을 조율해 합의를 만든다.", "갈등 상황에서도 균형을 유지한다."],
    unhealthyState: ["회피와 미루기가 늘어나 실행이 늦어진다.", "자기 의견을 뒤로 미루며 소진된다."],
    strengths: ["중재 능력", "포용력", "관계 안정화"],
    weaknesses: ["우선순위 혼란", "결정 지연", "자기주장 약화"],
  },
};

const PERSONALITY_GROWTH_MAP: Record<number, number> = {
  1: 7,
  2: 4,
  3: 6,
  4: 1,
  5: 8,
  6: 9,
  7: 5,
  8: 2,
  9: 3,
};

const PERSONALITY_STRESS_MAP: Record<number, number> = {
  1: 4,
  2: 8,
  3: 9,
  4: 2,
  5: 7,
  6: 3,
  7: 1,
  8: 5,
  9: 6,
};

function normalizeStrokes(resultData: unknown): Stroke[] {
  if (!resultData || typeof resultData !== "object") {
    return [];
  }

  const rawStrokes = (resultData as { strokes?: unknown }).strokes;
  if (!Array.isArray(rawStrokes)) {
    return [];
  }

  return rawStrokes
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const raw = item as {
        id?: unknown;
        color?: unknown;
        width?: unknown;
        points?: unknown;
      };
      if (!Array.isArray(raw.points)) return null;

      const points = raw.points
        .map((point) => {
          if (!point || typeof point !== "object") return null;
          const casted = point as { x?: unknown; y?: unknown };
          if (typeof casted.x !== "number" || typeof casted.y !== "number") {
            return null;
          }
          return { x: casted.x, y: casted.y };
        })
        .filter((point): point is Point => point !== null);

      if (points.length < 2) return null;

      return {
        id: typeof raw.id === "number" ? raw.id : index + 1,
        color: typeof raw.color === "string" ? raw.color : "#111111",
        width: typeof raw.width === "number" ? raw.width : 3,
        points,
      };
    })
    .filter((stroke): stroke is Stroke => stroke !== null);
}

function PersonalityPlusScoreChart({
  scores,
  primaryTypeNo,
  chartMin,
  chartMax,
}: {
  scores: PersonalityScorePoint[];
  primaryTypeNo: number;
  chartMin: number;
  chartMax: number;
}) {
  const chartWrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const yTicks = useMemo(
    () =>
      Array.from({ length: 6 }, (_, idx) => {
        const value = chartMax - ((chartMax - chartMin) * idx) / 5;
        return { value, label: Math.round(value) };
      }),
    [chartMax, chartMin],
  );

  const chartHeight = 210;
  const padding = useMemo(
    () => ({ top: 12, right: 14, bottom: 30, left: 42 }),
    [],
  );
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const toYPixel = useCallback(
    (score: number) => {
      if (chartMax === chartMin) return padding.top + plotHeight / 2;
      const ratio = (score - chartMin) / (chartMax - chartMin);
      return padding.top + (1 - ratio) * plotHeight;
    },
    [chartMax, chartMin, padding.bottom, padding.top, plotHeight],
  );

  const drawChart = useCallback(() => {
    const wrap = chartWrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const rect = wrap.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const plotLeft = padding.left;
    const plotTop = padding.top;
    const plotWidth = width - padding.left - padding.right;
    const localPlotHeight = height - padding.top - padding.bottom;

    const points = scores.map((item, idx) => ({
      typeNo: item.typeNo,
      x: plotLeft + ((idx + 0.5) / Math.max(1, scores.length)) * plotWidth,
      y: toYPixel(item.score),
    }));

    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#e9edf4";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(plotLeft, plotTop, plotWidth, localPlotHeight);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "#f3f5fa";
    points.forEach((point) => {
      ctx.beginPath();
      ctx.moveTo(point.x, plotTop);
      ctx.lineTo(point.x, plotTop + localPlotHeight);
      ctx.stroke();
    });

    ctx.strokeStyle = "#ebeff6";
    yTicks.forEach((tick, idx) => {
      const y = plotTop + (idx / Math.max(1, yTicks.length - 1)) * localPlotHeight;
      ctx.beginPath();
      ctx.moveTo(plotLeft, y);
      ctx.lineTo(plotLeft + plotWidth, y);
      ctx.stroke();
    });

    ctx.fillStyle = "#64748b";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    yTicks.forEach((tick, idx) => {
      const y = plotTop + (idx / Math.max(1, yTicks.length - 1)) * localPlotHeight;
      ctx.fillText(String(tick.label), plotLeft - 8, y);
    });

    if (points.length > 1) {
      // 유형별 점수를 꼭지점으로 지나는 곡선(Catmull-Rom -> Bezier)
      ctx.strokeStyle = "#2b9db8";
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i += 1) {
        const p0 = i === 0 ? points[i] : points[i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = i + 2 < points.length ? points[i + 2] : p2;
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      }
      ctx.stroke();
    } else if (points.length === 1) {
      ctx.strokeStyle = "#2b9db8";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[0].x, points[0].y);
      ctx.stroke();
    }

    points.forEach((point) => {
      const isPrimary = point.typeNo === primaryTypeNo;
      ctx.fillStyle = isPrimary ? "#4f46e5" : "#2b9db8";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(point.x, point.y, isPrimary ? 4.8 : 3.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    ctx.fillStyle = "#64748b";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    points.forEach((point) => {
      ctx.fillText(String(point.typeNo), point.x, plotTop + localPlotHeight + 8);
    });
  }, [padding.bottom, padding.left, padding.right, padding.top, primaryTypeNo, scores, toYPixel, yTicks]);

  useEffect(() => {
    drawChart();
    window.addEventListener("resize", drawChart);
    return () => window.removeEventListener("resize", drawChart);
  }, [drawChart]);

  return (
    <div className="mt-4">
      <div className="overflow-hidden rounded-lg border border-[#dce3ef] bg-white px-3 pb-2 pt-3">
        <div ref={chartWrapRef} className="relative h-[210px]">
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        </div>
      </div>
    </div>
  );
}

export function AssessmentResultView({ testSlug, resultData }: AssessmentResultViewProps) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showAttachmentPointTooltip, setShowAttachmentPointTooltip] = useState(false);
  const [isAttachmentDetailOpen, setIsAttachmentDetailOpen] = useState(false);
  const [isPersonalityPlusDetailOpen, setIsPersonalityPlusDetailOpen] = useState(false);
  const strokes = useMemo(() => normalizeStrokes(resultData), [resultData]);
  const personalityAnswers = useMemo(() => {
    if (!resultData || typeof resultData !== "object") return {} as Record<number, number>;
    const raw = (resultData as { answers?: unknown }).answers;
    if (!raw || typeof raw !== "object") return {} as Record<number, number>;
    return Object.entries(raw as Record<string, unknown>).reduce<Record<number, number>>(
      (acc, [key, value]) => {
        const no = Number(key);
        const score = Number(value);
        if (!Number.isFinite(no) || !Number.isFinite(score)) return acc;
        acc[no] = score;
        return acc;
      },
      {},
    );
  }, [resultData]);
  const genericScaleQuestions = useMemo(() => {
    if (!resultData || typeof resultData !== "object") return [] as string[];
    const raw = (resultData as { questions?: unknown }).questions;
    if (!Array.isArray(raw)) return [] as string[];
    return raw.filter((value): value is string => typeof value === "string");
  }, [resultData]);
  const genericScale = useMemo(() => {
    if (!resultData || typeof resultData !== "object") return [] as Array<{ value: number; label: string }>;
    const raw = (resultData as { scale?: unknown }).scale;
    if (!Array.isArray(raw)) return [] as Array<{ value: number; label: string }>;
    return raw
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const option = item as { value?: unknown; label?: unknown };
        if (typeof option.value !== "number" || typeof option.label !== "string") return null;
        return { value: option.value, label: option.label };
      })
      .filter((value): value is { value: number; label: string } => value !== null);
  }, [resultData]);
  const genericScaleAnswers = useMemo(() => {
    if (!resultData || typeof resultData !== "object") return {} as Record<number, number>;
    const raw = (resultData as { answers?: unknown }).answers;
    if (!raw || typeof raw !== "object") return {} as Record<number, number>;
    return Object.entries(raw as Record<string, unknown>).reduce<Record<number, number>>(
      (acc, [key, value]) => {
        const no = Number(key);
        const score = Number(value);
        if (!Number.isFinite(no) || !Number.isFinite(score)) return acc;
        acc[no] = score;
        return acc;
      },
      {},
    );
  }, [resultData]);
  const genericScaleLabelByValue = useMemo(
    () =>
      new Map(
        genericScale.map((item) => [item.value, item.label] as const),
      ),
    [genericScale],
  );
  const sentenceAnswers = useMemo(() => {
    if (!resultData || typeof resultData !== "object") return {} as Record<number, string>;
    const raw = (resultData as { answers?: unknown }).answers;
    if (!raw || typeof raw !== "object") return {} as Record<number, string>;
    return Object.entries(raw as Record<string, unknown>).reduce<Record<number, string>>(
      (acc, [key, value]) => {
        const no = Number(key);
        if (!Number.isFinite(no) || typeof value !== "string") return acc;
        acc[no] = value;
        return acc;
      },
      {},
    );
  }, [resultData]);
  const sentencePrompts = useMemo(() => {
    if (!resultData || typeof resultData !== "object") return [] as string[];
    const raw = (resultData as { prompts?: unknown }).prompts;
    if (!Array.isArray(raw)) return [] as string[];
    return raw.filter((item): item is string => typeof item === "string");
  }, [resultData]);
  const coreEmotionTypes = useMemo(() => {
    if (!resultData || typeof resultData !== "object") return [] as Array<{
      typeNo: number;
      categories: Array<{ name: string; items: Array<{ text: string; checked: boolean }> }>;
    }>;
    const format = (resultData as { format?: unknown }).format;
    if (format !== "core-emotion-grid") return [] as Array<{
      typeNo: number;
      categories: Array<{ name: string; items: Array<{ text: string; checked: boolean }> }>;
    }>;
    const rawTypes = (resultData as { types?: unknown }).types;
    if (!Array.isArray(rawTypes)) return [] as Array<{
      typeNo: number;
      categories: Array<{ name: string; items: Array<{ text: string; checked: boolean }> }>;
    }>;
    return rawTypes
      .map((rawType, index) => {
        if (!rawType || typeof rawType !== "object") return null;
        const typeNo =
          typeof (rawType as { typeNo?: unknown }).typeNo === "number"
            ? ((rawType as { typeNo: number }).typeNo)
            : index + 1;
        const rawCategories = (rawType as { categories?: unknown }).categories;
        if (!Array.isArray(rawCategories)) return null;
        const categories = rawCategories
          .map((rawCategory) => {
            if (!rawCategory || typeof rawCategory !== "object") return null;
            const name = (rawCategory as { name?: unknown }).name;
            const rawItems = (rawCategory as { items?: unknown }).items;
            if (typeof name !== "string" || !Array.isArray(rawItems)) return null;
            const items = rawItems
              .map((rawItem) => {
                if (!rawItem || typeof rawItem !== "object") return null;
                const item = rawItem as { text?: unknown; checked?: unknown };
                return {
                  text: typeof item.text === "string" ? item.text : "",
                  checked: item.checked === true,
                };
              })
              .filter((item): item is { text: string; checked: boolean } => item !== null);
            return { name, items };
          })
          .filter(
            (category): category is { name: string; items: Array<{ text: string; checked: boolean }> } =>
              category !== null,
          );
        return { typeNo, categories };
      })
      .filter(
        (type): type is {
          typeNo: number;
          categories: Array<{ name: string; items: Array<{ text: string; checked: boolean }> }>;
        } => type !== null,
      );
  }, [resultData]);

  const drawShapeBoard = useCallback((
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scale: number,
  ) => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 1.2 * scale;
    ctx.beginPath();
    ctx.moveTo(width / 3, 0);
    ctx.lineTo(width / 3, height);
    ctx.moveTo((width * 2) / 3, 0);
    ctx.lineTo((width * 2) / 3, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    const unit = Math.min(width / 3, height / 2) * 0.32;
    const centers = [
      { x: width / 6, y: height / 4 },
      { x: width / 2, y: height / 4 },
      { x: (width * 5) / 6, y: height / 4 },
      { x: width / 6, y: (height * 3) / 4 },
      { x: width / 2, y: (height * 3) / 4 },
      { x: (width * 5) / 6, y: (height * 3) / 4 },
    ];

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 1.6 * scale;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.arc(centers[0].x, centers[0].y, unit * 0.55, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centers[1].x, centers[1].y - unit * 0.7);
    ctx.lineTo(centers[1].x - unit * 0.8, centers[1].y + unit * 0.65);
    ctx.lineTo(centers[1].x + unit * 0.8, centers[1].y + unit * 0.65);
    ctx.closePath();
    ctx.stroke();

    const stepOffsetX = unit * 0.2;
    ctx.beginPath();
    ctx.moveTo(centers[2].x - unit * 0.9 + stepOffsetX, centers[2].y + unit * 0.6);
    ctx.lineTo(centers[2].x - unit * 0.55 + stepOffsetX, centers[2].y + unit * 0.6);
    ctx.lineTo(centers[2].x - unit * 0.55 + stepOffsetX, centers[2].y + unit * 0.2);
    ctx.lineTo(centers[2].x - unit * 0.2 + stepOffsetX, centers[2].y + unit * 0.2);
    ctx.lineTo(centers[2].x - unit * 0.2 + stepOffsetX, centers[2].y - unit * 0.2);
    ctx.lineTo(centers[2].x + unit * 0.15 + stepOffsetX, centers[2].y - unit * 0.2);
    ctx.lineTo(centers[2].x + unit * 0.15 + stepOffsetX, centers[2].y - unit * 0.6);
    ctx.lineTo(centers[2].x + unit * 0.5 + stepOffsetX, centers[2].y - unit * 0.6);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centers[3].x - unit * 0.75, centers[3].y);
    ctx.lineTo(centers[3].x + unit * 0.75, centers[3].y);
    ctx.moveTo(centers[3].x, centers[3].y - unit * 0.75);
    ctx.lineTo(centers[3].x, centers[3].y + unit * 0.75);
    ctx.stroke();

    const side = unit * 1.4;
    ctx.strokeRect(centers[4].x - side / 2, centers[4].y - side / 2, side, side);

    ctx.beginPath();
    ctx.moveTo(centers[5].x - unit * 0.95, centers[5].y + unit * 0.35);
    ctx.bezierCurveTo(
      centers[5].x - unit * 0.65,
      centers[5].y - unit * 0.55,
      centers[5].x - unit * 0.35,
      centers[5].y - unit * 0.55,
      centers[5].x - unit * 0.08,
      centers[5].y + unit * 0.15,
    );
    ctx.bezierCurveTo(
      centers[5].x + unit * 0.15,
      centers[5].y + unit * 0.75,
      centers[5].x + unit * 0.35,
      centers[5].y - unit * 0.5,
      centers[5].x + unit * 0.7,
      centers[5].y + unit * 0.25,
    );
    ctx.lineTo(centers[5].x + unit * 0.95, centers[5].y + unit * 0.55);
    ctx.stroke();
  }, []);

  const drawLifeGraphTemplate = useCallback((
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scale: number,
  ) => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    const framePadding = 10 * scale;
    const frameX = framePadding;
    const frameY = framePadding;
    const frameW = width - framePadding * 2;
    const frameH = height - framePadding * 2;

    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 1.2 * scale;
    ctx.strokeRect(frameX, frameY, frameW, frameH);

    ctx.fillStyle = "#9bd8e8";
    ctx.font = `600 ${Math.max(28, 44 * scale)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Life Graph", width / 2, frameY + 42 * scale);

    ctx.fillStyle = "#334155";
    ctx.font = `600 ${Math.max(10, 14 * scale)}px sans-serif`;
    ctx.fillText(
      "양육자와의 관계, 친구, 애인, 형제, 이사, 전학, 충격적인 사건, 집착 물건 등",
      width / 2,
      frameY + 82 * scale,
    );
    ctx.fillText("기억에 남는 것을 중심으로 작성해주세요.", width / 2, frameY + 102 * scale);

    const axisLeft = frameX + 72 * scale;
    const axisTop = frameY + 136 * scale;
    const axisBottom = frameY + frameH - 28 * scale;
    const axisRight = frameX + frameW - 66 * scale;
    const midY = (axisTop + axisBottom) / 2;

    ctx.strokeStyle = "#8ba2b4";
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(axisLeft, axisTop);
    ctx.lineTo(axisLeft, axisBottom);
    ctx.moveTo(axisLeft, midY);
    ctx.lineTo(axisRight, midY);
    ctx.stroke();

    ctx.fillStyle = "#1e293b";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.font = `700 ${Math.max(12, 14 * scale)}px sans-serif`;
    ctx.fillText("주관적 만족감", frameX + 8 * scale, axisTop - 8 * scale);
    ctx.font = `700 ${Math.max(13, 16 * scale)}px sans-serif`;
    ctx.fillText("+10", axisLeft - 26 * scale, axisTop + 6 * scale);
    ctx.fillText("0", axisLeft - 16 * scale, midY + 6 * scale);
    ctx.fillText("-10", axisLeft - 26 * scale, axisBottom + 6 * scale);
  }, []);

  const drawStrokes = useCallback((ctx: CanvasRenderingContext2D, scale: number) => {
    strokes.forEach((stroke) => {
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width * scale;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x * scale, stroke.points[0].y * scale);
      for (let i = 1; i < stroke.points.length; i += 1) {
        ctx.lineTo(stroke.points[i].x * scale, stroke.points[i].y * scale);
      }
      ctx.stroke();
    });
  }, [strokes]);

  const redraw = useCallback(() => {
    const board = boardRef.current;
    const canvas = canvasRef.current;
    if (!board || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const { width, height } = board.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const scaledWidth = width * dpr;
    const scaledHeight = height * dpr;
    ctx.clearRect(0, 0, scaledWidth, scaledHeight);
    if (testSlug === "shape-6") {
      drawShapeBoard(ctx, scaledWidth, scaledHeight, dpr);
    } else if (testSlug === "life-graph") {
      drawLifeGraphTemplate(ctx, scaledWidth, scaledHeight, dpr);
    } else if (testSlug === "htp") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, scaledWidth, scaledHeight);
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1.2 * dpr;
      ctx.strokeRect(0, 0, scaledWidth, scaledHeight);
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, scaledWidth, scaledHeight);
    }
    drawStrokes(ctx, dpr);
  }, [drawLifeGraphTemplate, drawShapeBoard, drawStrokes, testSlug]);

  useEffect(() => {
    redraw();
    window.addEventListener("resize", redraw);
    return () => window.removeEventListener("resize", redraw);
  }, [redraw]);

  if (testSlug === "personality") {
    return (
      <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white">
        <table className="min-w-[760px] w-full border-collapse text-xs sm:min-w-[900px] sm:text-sm">
          <thead className="bg-slate-100 text-slate-900">
            <tr>
              <th className="border border-slate-300 px-3 py-2 text-center font-semibold">번호</th>
              <th className="border border-slate-300 px-3 py-2 text-left font-semibold">문항</th>
              <th className="border border-slate-300 px-3 py-2 text-center font-semibold">응답</th>
            </tr>
          </thead>
          <tbody>
            {PERSONALITY_QUESTIONS.map((question) => {
              const score = personalityAnswers[question.no];
              const label = PERSONALITY_SCALE_OPTIONS.find((option) => option.value === score)?.label ?? "-";
              return (
                <tr key={question.no} className="odd:bg-white even:bg-slate-50">
                  <td className="border border-slate-200 px-3 py-2 text-center">{question.no}</td>
                  <td className="border border-slate-200 px-3 py-2">{question.text}</td>
                  <td className="border border-slate-200 px-3 py-2 text-center">{label}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  if (
    testSlug === "attachment" &&
    genericScaleQuestions.length > 0
  ) {
    const anxietyItemNos = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36];
    const avoidanceItemNos = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35];
    const toScoredValue = (raw: number | undefined) => {
      if (raw == null) return null;
      return raw;
    };

    const getAverage = (itemNos: number[]) => {
      const scores = itemNos
        .map((no) => toScoredValue(genericScaleAnswers[no]))
        .filter((score): score is number => score != null);
      if (scores.length === 0) return null;
      return scores.reduce((acc, score) => acc + score, 0) / scores.length;
    };

    const anxietyAvg = getAverage(anxietyItemNos);
    const avoidanceAvg = getAverage(avoidanceItemNos);
    const anxietySum = anxietyItemNos.reduce((acc, no) => {
      const score = toScoredValue(genericScaleAnswers[no]);
      return acc + (score ?? 0);
    }, 0);
    const avoidanceSum = avoidanceItemNos.reduce((acc, no) => {
      const score = toScoredValue(genericScaleAnswers[no]);
      return acc + (score ?? 0);
    }, 0);
    const answeredTotal = Object.keys(genericScaleAnswers).length;

    const toLevel = (value: number | null) => {
      if (value == null) return "측정 불가";
      if (value < 2.5) return "낮음";
      if (value < 3.5) return "중간";
      return "높음";
    };

    const isAnxietyHigh = anxietySum >= 54;
    const isAvoidanceHigh = avoidanceSum >= 54;
    const attachmentType = (() => {
      if (anxietyAvg == null || avoidanceAvg == null) return "분석 불가";
      if (!isAnxietyHigh && !isAvoidanceHigh) return "안정형";
      if (isAnxietyHigh && !isAvoidanceHigh) return "불안형 (Preoccupied)";
      if (!isAnxietyHigh && isAvoidanceHigh) return "회피형 (Dismissive)";
      return "혼란형 (Fearful)";
    })();

    const attachmentAnalysis = (() => {
      if (attachmentType === "안정형") {
        return {
          summary:
            "친밀감과 자율성의 균형이 비교적 잘 유지되는 편입니다. 관계에서 안정적인 신뢰를 형성할 가능성이 높습니다.",
          strengths: [
            "관계 상황에서 감정 조절이 비교적 안정적임",
            "필요할 때 도움을 요청하고 수용하는 균형감",
          ],
          cautions: [
            "과도한 자기확신으로 상대 신호를 놓치지 않기",
            "관계 유지 노력(대화/확인)을 꾸준히 이어가기",
          ],
          guide:
            "현재의 안정성을 유지할 수 있도록 정기적으로 감정 상태를 점검하고, 중요한 관계에서는 기대와 경계를 명확히 표현해보세요.",
        };
      }
      if (attachmentType === "불안형 (Preoccupied)") {
        return {
          summary:
            "친밀감 욕구가 강하고 타인으로부터의 인정·수용에 민감합니다. 관계가 멀어질까 불안해 과몰입하는 경향이 있을 수 있습니다.",
          strengths: [
            "관계 변화에 빠르게 알아차리는 민감성",
            "타인에게 헌신적이고 따뜻한 태도",
          ],
          cautions: [
            "상대의 사소한 행동에 거절감을 크게 느낄 수 있음",
            "감정이 올라올 때 표현이 급해질 수 있음",
          ],
          guide:
            "자기 가치를 타인의 반응에서만 찾지 않도록, 혼자만의 회복 루틴(호흡/감정기록/거리두기)을 만들어 감정의 속도를 낮추는 연습이 도움이 됩니다.",
        };
      }
      if (attachmentType === "회피형 (Dismissive)") {
        return {
          summary:
            "독립성과 자기통제를 중시하며, 친밀해질수록 거리두기를 선택하는 경향이 나타날 수 있습니다.",
          strengths: [
            "상황 판단 시 감정에 휩쓸리지 않는 편",
            "스스로 문제를 정리하고 버티는 힘",
          ],
          cautions: [
            "도움 요청을 미루다 관계 단절로 이어질 수 있음",
            "감정 표현 부족으로 오해가 쌓일 수 있음",
          ],
          guide:
            "완전한 개방보다 '작게 표현하기'부터 시작해보세요. 하루 한 번 감정 언어를 말로 꺼내는 연습이 관계 안정에 효과적입니다.",
        };
      }
      if (attachmentType === "혼란형 (Fearful)") {
        return {
          summary:
            "가까워지고 싶은 마음과 상처받을까 두려운 마음이 동시에 작동해 관계에서 접근-회피의 혼란을 경험할 수 있습니다.",
          strengths: [
            "관계의 위험 신호를 빨리 감지하는 직관",
            "깊은 관계를 원하는 진정성 있는 욕구",
          ],
          cautions: [
            "가까워질수록 갑작스러운 거리두기가 발생할 수 있음",
            "자기비난과 불안이 반복될 가능성",
          ],
          guide:
            "관계 속도 조절이 핵심입니다. 신뢰 가능한 관계에서 '안전한 대화 규칙'을 먼저 합의하고, 정기적인 감정 점검 시간을 가져보세요.",
        };
      }
      return {
        summary: "응답 데이터가 충분하지 않아 유형을 판정하기 어렵습니다.",
        strengths: ["응답 데이터를 먼저 충분히 확보해주세요."],
        cautions: ["미응답 문항을 완료한 뒤 다시 분석해보세요."],
        guide: "전체 문항 응답 후 저장하면 보다 정확한 결과를 확인할 수 있습니다.",
      };
    })();

    const chartMin = 18;
    const chartMax = 90;
    const toChartPercent = (value: number) => ((value - chartMin) / (chartMax - chartMin)) * 100;
    const pointLeft = Math.min(100, Math.max(0, toChartPercent(avoidanceSum)));
    const pointBottom = Math.min(100, Math.max(0, toChartPercent(anxietySum)));

    const progressWidth = (value: number) => `${Math.round((value / 90) * 100)}%`;

    const getAttachmentAnswerClass = (score?: number) => {
      if (score === 5) return "text-emerald-700";
      if (score === 4) return "text-green-700";
      if (score === 3) return "text-slate-600";
      if (score === 2) return "text-orange-700";
      if (score === 1) return "text-rose-700";
      return "text-slate-500";
    };

    return (
      <section className="space-y-6 rounded-[28px] border border-[#e4e9f4] bg-[#f5f7fc] p-5 sm:p-8">
        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.95fr]">
          <article className="rounded-3xl border border-[#dfe5f1] bg-white p-5 shadow-[0_8px_22px_rgba(79,70,229,0.08)] sm:p-6">
            <p className="mb-4 inline-flex items-center gap-2 text-base font-semibold text-slate-800">
              <BarChart3 className="h-5 w-5 text-[#5e4ee9]" />
              애착 사분면 그래프
            </p>
            <div className="relative h-[360px] overflow-visible rounded-xl bg-white">
              <div className="absolute left-14 right-10 top-8 bottom-14 border border-[#dfe5f3] bg-[#fcfdff]">
                <div className="absolute inset-0 grid grid-cols-7 grid-rows-7">
                  {Array.from({ length: 49 }).map((_, index) => (
                    <div key={index} className="border border-[#edf1fa]" />
                  ))}
                </div>
                <button
                  type="button"
                  aria-label="애착 점수 보기"
                  onMouseEnter={() => setShowAttachmentPointTooltip(true)}
                  onMouseLeave={() => setShowAttachmentPointTooltip(false)}
                  onFocus={() => setShowAttachmentPointTooltip(true)}
                  onBlur={() => setShowAttachmentPointTooltip(false)}
                  onTouchStart={() => setShowAttachmentPointTooltip(true)}
                  onTouchEnd={() => {
                    window.setTimeout(() => setShowAttachmentPointTooltip(false), 1600);
                  }}
                  className="absolute h-4 w-4 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#5a46ef] shadow-[0_0_0_7px_rgba(90,70,239,0.24)] focus:outline-none"
                  style={{ left: `${pointLeft}%`, bottom: `${pointBottom}%` }}
                />
                {showAttachmentPointTooltip ? (
                  <div
                    className="absolute z-10 -translate-x-1/2 -translate-y-full rounded-md bg-[#2b2f84] px-2.5 py-1.5 text-[11px] font-medium text-white shadow-lg"
                    style={{ left: `${pointLeft}%`, bottom: `calc(${pointBottom}% + 18px)` }}
                  >
                    회피 {avoidanceSum} / 불안 {anxietySum}
                  </div>
                ) : null}
              </div>

              <div className="absolute left-3 top-8 bottom-14 w-8 text-xs text-slate-500">
                {[90, 80, 70, 60, 50, 40, 30, 18].map((tick, index, arr) => (
                  <span
                    key={tick}
                    className="absolute right-0 -translate-y-1/2"
                    style={{ top: `${(index / (arr.length - 1)) * 100}%` }}
                  >
                    {tick}
                  </span>
                ))}
              </div>
              <div className="absolute left-14 right-10 bottom-6 h-4 text-xs text-slate-500">
                {[18, 30, 40, 50, 60, 70, 80, 90].map((tick, index, arr) => (
                  <span
                    key={tick}
                    className="absolute -translate-x-1/2"
                    style={{ left: `${(index / (arr.length - 1)) * 100}%` }}
                  >
                    {tick}
                  </span>
                ))}
              </div>
              <p className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-semibold text-slate-500">
                불안 수치 (Anxiety)
              </p>
              <p className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs font-semibold text-slate-500">
                회피 수치 (Avoidance)
              </p>
            </div>
          </article>

          <article className="flex min-h-[420px] flex-col justify-between rounded-3xl border border-[#6d5de8] bg-gradient-to-br from-[#5e44e8] via-[#5a3fe3] to-[#4e35d2] px-7 py-6 text-white shadow-[0_16px_30px_rgba(79,58,194,0.34)] sm:px-8 sm:py-7">
            <div className="pt-1">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#dbd7ff]">ANALYSIS RESULT</p>
              <p className="mt-2 text-[32px] font-bold leading-none tracking-tight">{attachmentType}</p>

              <div className="mt-7 space-y-4">
                <div>
                  <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-white/90">
                    <span>회피성 지수 (AVOIDANCE)</span>
                    <span>{avoidanceSum} / 90</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/28">
                    <div className="h-2 rounded-full bg-[#f2f1ff]" style={{ width: progressWidth(avoidanceSum) }} />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-white/90">
                    <span>불안성 지수 (ANXIETY)</span>
                    <span>{anxietySum} / 90</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/28">
                    <div className="h-2 rounded-full bg-[#f2f1ff]" style={{ width: progressWidth(anxietySum) }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="pb-1">
              <p className="text-[11px] text-white/75">
                * 점수가 54점 이상일 경우 해당 경향성이 높다고 판단합니다.
              </p>
              <p className="mt-2 text-[11px] text-white/85">
                응답 완료: {answeredTotal} / {genericScaleQuestions.length} · 불안 평균{" "}
                {anxietyAvg == null ? "-" : anxietyAvg.toFixed(2)}({toLevel(anxietyAvg)}) · 회피 평균{" "}
                {avoidanceAvg == null ? "-" : avoidanceAvg.toFixed(2)}({toLevel(avoidanceAvg)})
              </p>
            </div>
          </article>
        </div>

        <article className="rounded-[22px] border border-[#dddaf9] bg-[#f6f4ff] px-6 py-5 sm:px-8 sm:py-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#edeaff] text-[#5e4ee9]">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <h3 className="text-xl font-semibold tracking-tight text-slate-800 sm:text-2xl">
              {attachmentType}의 특징
            </h3>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[#4f4a6d]">{attachmentAnalysis.summary}</p>
        </article>

        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-[22px] border border-[#cfe7da] bg-[#eaf7f0] p-6 shadow-[0_8px_20px_rgba(31,123,83,0.08)]">
            <h4 className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-[#1f7b53] sm:text-xl">
              <Heart className="h-6 w-6" />
              관계적 강점
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-700">
              {attachmentAnalysis.strengths.map((strength) => (
                <li key={strength}>• {strength}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-[22px] border border-[#f3d8e0] bg-[#fff0f4] p-6 shadow-[0_8px_20px_rgba(188,61,89,0.08)]">
            <h4 className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-[#bc3d59] sm:text-xl">
              <AlertCircle className="h-6 w-6" />
              주의 및 개선점
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-700">
              {attachmentAnalysis.cautions.map((caution) => (
                <li key={caution}>• {caution}</li>
              ))}
            </ul>
          </article>
        </div>

        <article className="rounded-[22px] border border-[#1a2e59] bg-gradient-to-r from-[#101b39] via-[#0d1731] to-[#101b39] px-6 py-6 text-white shadow-[0_10px_26px_rgba(15,23,42,0.22)] sm:px-8 sm:py-7">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#ffd43b] text-[#18223d]">
              <Lightbulb className="h-8 w-8" />
            </span>
            <div>
              <h4 className="text-lg font-semibold tracking-tight text-[#ffd447] sm:text-xl">
                나를 위한 성장 가이드
              </h4>
              <p className="mt-3 text-sm leading-relaxed text-slate-100">{attachmentAnalysis.guide}</p>
            </div>
          </div>
        </article>

        <div>
          <div className="mb-4 flex justify-center">
            <button
              type="button"
              onClick={() => setIsAttachmentDetailOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#d8dfeb] bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {isAttachmentDetailOpen ? "답변 상세 내역 숨기기" : "답변 상세 내역 보기"}
            </button>
          </div>

          {isAttachmentDetailOpen ? (
            <div className="cg-panel p-4 sm:p-6">
              <h3 className="mb-4 text-center text-lg font-semibold text-slate-800">상세 답변 내역</h3>
              <div className="overflow-x-auto">
                <table className="min-w-[980px] w-full border-collapse text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-800">
                    <tr>
                      <th className="border border-slate-200 px-3 py-2 text-center font-semibold">번호</th>
                      <th className="border border-slate-200 px-3 py-2 text-left font-semibold">문항</th>
                      <th className="border border-slate-200 px-3 py-2 text-center font-semibold">나의 선택</th>
                      <th className="border border-slate-200 px-3 py-2 text-center font-semibold">채점 포함</th>
                    </tr>
                  </thead>
                  <tbody>
                    {genericScaleQuestions.map((question, index) => {
                      const no = index + 1;
                      const score = genericScaleAnswers[no];
                      const label = score != null ? genericScaleLabelByValue.get(score) ?? "-" : "-";
                      return (
                        <tr key={no} className="odd:bg-white even:bg-slate-50/50">
                          <td className="border border-slate-200 px-3 py-2 text-center">{no}</td>
                          <td className="border border-slate-200 px-3 py-2 text-slate-700">{question}</td>
                          <td className={`border border-slate-200 px-3 py-2 text-center font-medium ${getAttachmentAnswerClass(score)}`}>
                            {label}
                          </td>
                          <td className="border border-slate-200 px-3 py-2 text-center text-[#365b9c]">
                            {score != null ? "포함" : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  if (
    testSlug === "personality-plus" &&
    genericScaleQuestions.length > 0
  ) {
    const typeScores = Array.from({ length: 9 }, (_, idx) => {
      const typeNo = idx + 1;
      const start = idx * 11 + 1;
      const end = start + 10;
      const score = Array.from({ length: end - start + 1 }, (_, offset) => start + offset).reduce(
        (acc, questionNo) => acc + (genericScaleAnswers[questionNo] ?? 0),
        0,
      );
      return { typeNo, score };
    });

    const sortedScores = [...typeScores].sort((a, b) => b.score - a.score);
    const primary = sortedScores[0] ?? { typeNo: 1, score: 0 };
    const profile = PERSONALITY_PLUS_TYPE_PROFILES[primary.typeNo] ?? PERSONALITY_PLUS_TYPE_PROFILES[1];
    const prevType = primary.typeNo === 1 ? 9 : primary.typeNo - 1;
    const nextType = primary.typeNo === 9 ? 1 : primary.typeNo + 1;
    const wingLeftScore = typeScores.find((item) => item.typeNo === prevType)?.score ?? 0;
    const wingRightScore = typeScores.find((item) => item.typeNo === nextType)?.score ?? 0;
    const wingType = wingLeftScore >= wingRightScore ? prevType : nextType;
    const growthType = PERSONALITY_GROWTH_MAP[primary.typeNo];
    const stressType = PERSONALITY_STRESS_MAP[primary.typeNo];
    const getPersonalityPlusAnswerClass = (score?: number) => {
      if (score === 4) return "text-emerald-700";
      if (score === 3) return "text-green-700";
      if (score === 2) return "text-orange-700";
      if (score === 1) return "text-rose-700";
      return "text-slate-500";
    };

    const minScore = Math.min(...typeScores.map((item) => item.score));
    const maxScore = Math.max(...typeScores.map((item) => item.score));
    const chartMin = Math.max(0, minScore - 4);
    const chartMax = maxScore + 2;
    return (
      <section className="cg-panel space-y-6 p-4 sm:p-6">
        <article className="cg-panel-muted p-4 sm:p-5">
          <div>
            <p className="cg-kicker">에니어그램 성격 유형 검사 결과</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-800">유형별 점수 분포</h3>
          </div>
          <PersonalityPlusScoreChart
            scores={typeScores}
            primaryTypeNo={primary.typeNo}
            chartMin={chartMin}
            chartMax={chartMax}
          />
        </article>

        <article className="overflow-x-auto">
          <table className="min-w-[760px] w-full border-collapse text-xs sm:text-sm">
            <thead className="bg-slate-100 text-slate-900">
              <tr>
                {typeScores.map((item) => (
                  <th key={item.typeNo} className="border border-slate-300 px-3 py-2 text-center font-semibold">
                    유형 {item.typeNo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {typeScores.map((item) => (
                  <td key={item.typeNo} className="border border-slate-200 px-3 py-2 text-center">
                    {item.score}점
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </article>

        <article className="overflow-x-auto">
          <table className="min-w-[640px] w-full border-collapse text-xs sm:text-sm">
            <thead className="bg-slate-100 text-slate-900">
              <tr>
                <th className="border border-slate-300 px-3 py-2 text-center font-semibold">나의 유형</th>
                <th className="border border-slate-300 px-3 py-2 text-center font-semibold">날개</th>
                <th className="border border-slate-300 px-3 py-2 text-center font-semibold">통합 방향</th>
                <th className="border border-slate-300 px-3 py-2 text-center font-semibold">분열 방향</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-200 px-3 py-2 text-center">
                  {primary.typeNo} 유형 ({profile.name})
                </td>
                <td className="border border-slate-200 px-3 py-2 text-center">{wingType} 유형</td>
                <td className="border border-slate-200 px-3 py-2 text-center">{growthType} 유형</td>
                <td className="border border-slate-200 px-3 py-2 text-center">{stressType} 유형</td>
              </tr>
            </tbody>
          </table>
        </article>

        <article className="cg-panel-muted p-5">
          <h3 className="text-xl font-semibold text-[#2e59b5]">
            나의 유형: {profile.name}, {profile.subtitle} ({primary.typeNo} 유형)
          </h3>
          <div className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700">
            <p>
              <span className="font-semibold text-[#1f7b53]">핵심 특성</span>: {profile.core}
            </p>
            <p>
              <span className="font-semibold text-[#1f7b53]">동기</span>: {profile.desire}
            </p>
            <p>
              <span className="font-semibold text-[#b45309]">불안/회피</span>: {profile.fear}
            </p>
            <p>
              <span className="font-semibold text-[#4f46e5]">핵심 키워드</span>: {profile.keywords.join(", ")}
            </p>
          </div>
        </article>

        <div className="grid gap-4 lg:grid-cols-2">
          <article className="cg-panel border-[#d7ebe1] bg-[#eff8f3] p-5">
            <h4 className="text-lg font-semibold text-[#1f7b53]">상태별 성장 (긍정적 상태)</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {profile.healthyState.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </article>
          <article className="cg-panel border-[#f0dce2] bg-[#fff3f6] p-5">
            <h4 className="text-lg font-semibold text-[#bc3d59]">상태별 성장 (부정적 상태)</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {profile.unhealthyState.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </article>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <article className="cg-panel p-5">
            <h4 className="text-base font-semibold text-[#1f2a37]">강점</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {profile.strengths.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </article>
          <article className="cg-panel p-5">
            <h4 className="text-base font-semibold text-[#6d28d9]">약점</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {profile.weaknesses.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </article>
        </div>

        <div>
          <div className="mb-4 flex justify-center">
            <button
              type="button"
              onClick={() => setIsPersonalityPlusDetailOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#d8dfeb] bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {isPersonalityPlusDetailOpen ? "답변 상세 숨기기" : "답변 상세 보기"}
            </button>
          </div>

          {isPersonalityPlusDetailOpen ? (
            <div className="cg-panel p-4 sm:p-6">
              <h3 className="mb-4 text-center text-lg font-semibold text-slate-800">내가 선택한 모든 답변</h3>
              <div className="overflow-x-auto">
                <table className="min-w-[980px] w-full border-collapse text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-800">
                    <tr>
                      <th className="border border-slate-200 px-3 py-2 text-center font-semibold">번호</th>
                      <th className="border border-slate-200 px-3 py-2 text-left font-semibold">문항</th>
                      <th className="border border-slate-200 px-3 py-2 text-center font-semibold">나의 선택</th>
                      <th className="border border-slate-200 px-3 py-2 text-center font-semibold">채점 포함</th>
                    </tr>
                  </thead>
                  <tbody>
                    {genericScaleQuestions.map((question, index) => {
                      const no = index + 1;
                      const score = genericScaleAnswers[no];
                      const label = score != null ? genericScaleLabelByValue.get(score) ?? "-" : "-";
                      const isScored = index % 11 !== 10;
                      const displayNo = isScored ? String((index % 11) + 1) : "※";
                      const questionText = question.replace(/^(※|\d+)\s+/, "");
                      return (
                        <tr key={no} className="odd:bg-white even:bg-slate-50/50">
                          <td className="border border-slate-200 px-3 py-2 text-center">{displayNo}</td>
                          <td className="border border-slate-200 px-3 py-2 text-slate-700">{questionText}</td>
                          <td className={`border border-slate-200 px-3 py-2 text-center font-medium ${getPersonalityPlusAnswerClass(score)}`}>
                            {label}
                            {score != null ? <span className="ml-1 text-xs text-slate-500">({score}점)</span> : null}
                          </td>
                          <td className="border border-slate-200 px-3 py-2 text-center">
                            <span
                              className={`inline-flex min-w-12 items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                isScored
                                  ? "bg-[#eaf2ff] text-[#2b5fb3]"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {isScored ? "포함" : "제외"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  if (
    testSlug === "core-emotion" &&
    genericScaleQuestions.length > 0
  ) {
    return (
      <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white">
        <table className="min-w-[760px] w-full border-collapse text-xs sm:min-w-[900px] sm:text-sm">
          <thead className="bg-slate-100 text-slate-900">
            <tr>
              <th className="border border-slate-300 px-3 py-2 text-center font-semibold">번호</th>
              <th className="border border-slate-300 px-3 py-2 text-left font-semibold">문항</th>
              <th className="border border-slate-300 px-3 py-2 text-center font-semibold">응답</th>
            </tr>
          </thead>
          <tbody>
            {genericScaleQuestions.map((question, index) => {
              const no = index + 1;
              const score = genericScaleAnswers[no];
              const label = genericScale.find((item) => item.value === score)?.label ?? "-";
              return (
                <tr key={no} className="odd:bg-white even:bg-slate-50">
                  <td className="border border-slate-200 px-3 py-2 text-center">{no}</td>
                  <td className="border border-slate-200 px-3 py-2">{question}</td>
                  <td className="border border-slate-200 px-3 py-2 text-center">{label}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  if (testSlug === "sentence-completion" && sentencePrompts.length > 0) {
    return (
      <div className="space-y-3 rounded-xl border border-slate-300 bg-white p-4 sm:p-6">
        {sentencePrompts.map((prompt, index) => {
          const no = index + 1;
          return (
            <article key={no} className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
              <p className="text-sm font-semibold text-slate-800">
                {no}. {prompt}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                {sentenceAnswers[no] || "-"}
              </p>
            </article>
          );
        })}
      </div>
    );
  }

  if (testSlug === "core-emotion" && coreEmotionTypes.length > 0) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {coreEmotionTypes.map((type) => (
          <article
            key={type.typeNo}
            className="rounded-xl border border-slate-300 bg-white p-3 sm:p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-slate-900">
                {getCoreEmotionTypeName(type.typeNo)}
              </h3>
              <p className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                선택된 항목:{" "}
                {type.categories.reduce(
                  (acc, category) => acc + category.items.filter((item) => item.checked).length,
                  0,
                )}
                개
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[520px] w-full table-fixed border-collapse text-xs sm:text-sm">
                <colgroup>
                  <col className="w-24 sm:w-28" />
                  <col />
                </colgroup>
                <thead className="bg-slate-100 text-slate-900">
                  <tr>
                    <th className="border border-slate-300 px-2 py-2 text-left font-semibold">카테고리</th>
                    <th className="border border-slate-300 px-2 py-2 text-left font-semibold">항목</th>
                  </tr>
                </thead>
                <tbody>
                  {type.categories.map((category) => (
                    <tr key={category.name} className="align-top">
                      <td className="border border-slate-200 px-2 py-2 font-medium text-slate-700">
                        {category.name}
                      </td>
                      <td className="border border-slate-200 px-2 py-2">
                        <div className="space-y-1.5">
                          {category.items.map((item, index) => (
                            <div
                              key={index}
                              className={`flex items-center gap-2 rounded-sm px-1 py-0.5 ${
                                item.checked ? "bg-[#eef4ff]" : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={item.checked}
                                readOnly
                                className="h-4 w-4 accent-[#2f4f46]"
                              />
                              <span className="text-xs text-slate-700 sm:text-sm">
                                {item.text || "항목 미입력"}
                              </span>
                            </div>
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
    );
  }

  if (testSlug !== "shape-6" && testSlug !== "life-graph" && testSlug !== "htp") {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="mb-3 text-sm font-semibold text-slate-700">저장된 원본 데이터</p>
        <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-slate-700">
          {JSON.stringify(resultData, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-300 bg-white p-1.5 sm:p-2">
      <div
        ref={boardRef}
        className="relative w-full overflow-hidden rounded-md border border-slate-200 aspect-[16/10] lg:aspect-[16/9]"
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      </div>
      <p className="mt-2 text-xs text-slate-500">저장된 그리기 결과를 읽기 전용으로 표시합니다.</p>
    </div>
  );
}
