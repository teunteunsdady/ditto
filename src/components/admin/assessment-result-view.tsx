"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
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

export function AssessmentResultView({ testSlug, resultData }: AssessmentResultViewProps) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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
    (testSlug === "attachment" || testSlug === "core-emotion" || testSlug === "personality-plus") &&
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
            <h3 className="mb-3 text-base font-semibold text-slate-900">
              감정 유형 {type.typeNo}
            </h3>
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
                            <div key={index} className="flex items-center gap-2">
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
