"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type ToolMode = "draw" | "erase";
type Point = { x: number; y: number };
type Stroke = {
  id: number;
  points: Point[];
  color: string;
  width: number;
};

type LifeGraphBoardProps = {
  clientId?: string;
};

function normalizeStrokes(value: unknown): Stroke[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
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

export function LifeGraphBoard({ clientId }: LifeGraphBoardProps) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dpiScaleRef = useRef(1);
  const isDrawingRef = useRef(false);
  const activeStrokeIdRef = useRef<number | null>(null);
  const strokeIdRef = useRef(1);
  const latestStrokesRef = useRef<Stroke[]>([]);

  const [mode, setMode] = useState<ToolMode>("draw");
  const [lineColor, setLineColor] = useState("#111111");
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const resultHref = clientId ? `/admin/clients/curriculum/life-graph/result?clientId=${clientId}` : "";

  useEffect(() => {
    latestStrokesRef.current = strokes;
  }, [strokes]);

  useEffect(() => {
    if (!clientId) return;

    const controller = new AbortController();
    const loadSavedResult = async () => {
      try {
        const response = await fetch(`/api/clients/${clientId}/tests/life-graph`, {
          signal: controller.signal,
        });
        const payload = (await response.json().catch(() => null)) as
          | { item?: { resultData?: { strokes?: unknown } | null } | null }
          | null;
        if (!response.ok || !payload?.item?.resultData) {
          return;
        }

        const savedStrokes = normalizeStrokes(payload.item.resultData.strokes);
        setStrokes(savedStrokes);
        const maxId = savedStrokes.reduce((max, stroke) => Math.max(max, stroke.id), 0);
        strokeIdRef.current = maxId + 1;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    };

    void loadSavedResult();
    return () => controller.abort();
  }, [clientId]);

  const drawTemplate = useCallback((
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

  const drawStrokes = useCallback((
    ctx: CanvasRenderingContext2D,
    targetStrokes: Stroke[],
    scale: number,
  ) => {
    targetStrokes.forEach((stroke) => {
      if (stroke.points.length < 2) {
        return;
      }
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width * scale;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalCompositeOperation = "source-over";
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x * scale, stroke.points[0].y * scale);
      for (let i = 1; i < stroke.points.length; i += 1) {
        ctx.lineTo(stroke.points[i].x * scale, stroke.points[i].y * scale);
      }
      ctx.stroke();
    });
  }, []);

  const redraw = useCallback((targetStrokes: Stroke[]) => {
    const board = boardRef.current;
    const canvas = canvasRef.current;
    if (!board || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = board.getBoundingClientRect();
    const scale = dpiScaleRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTemplate(ctx, width * scale, height * scale, scale);
    drawStrokes(ctx, targetStrokes, scale);
  }, [drawTemplate, drawStrokes]);

  const resizeCanvas = useCallback(() => {
    const board = boardRef.current;
    const canvas = canvasRef.current;
    if (!board || !canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const { width, height } = board.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    dpiScaleRef.current = dpr;
    redraw(latestStrokesRef.current);
  }, [redraw]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const distancePointToSegment = (point: Point, a: Point, b: Point) => {
    const vx = b.x - a.x;
    const vy = b.y - a.y;
    const wx = point.x - a.x;
    const wy = point.y - a.y;

    const c1 = vx * wx + vy * wy;
    if (c1 <= 0) {
      return Math.hypot(point.x - a.x, point.y - a.y);
    }

    const c2 = vx * vx + vy * vy;
    if (c2 <= c1) {
      return Math.hypot(point.x - b.x, point.y - b.y);
    }

    const t = c1 / c2;
    const px = a.x + t * vx;
    const py = a.y + t * vy;
    return Math.hypot(point.x - px, point.y - py);
  };

  const findNearestStrokeId = (point: Point) => {
    let nearestId: number | null = null;
    let minDistance = Number.POSITIVE_INFINITY;
    const threshold = 12;

    latestStrokesRef.current.forEach((stroke) => {
      for (let i = 0; i < stroke.points.length - 1; i += 1) {
        const dist = distancePointToSegment(point, stroke.points[i], stroke.points[i + 1]);
        if (dist < minDistance) {
          minDistance = dist;
          nearestId = stroke.id;
        }
      }
    });

    if (minDistance <= threshold) {
      return nearestId;
    }
    return null;
  };

  const eraseStrokeAtPoint = (point: Point) => {
    const nearestId = findNearestStrokeId(point);
    if (nearestId == null) {
      return;
    }
    setStrokes((prev) => prev.filter((stroke) => stroke.id !== nearestId));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = getPoint(event);

    if (mode === "erase") {
      isDrawingRef.current = true;
      eraseStrokeAtPoint(point);
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }

    const newStroke: Stroke = {
      id: strokeIdRef.current++,
      points: [point],
      color: lineColor,
      width: 3,
    };
    activeStrokeIdRef.current = newStroke.id;
    setStrokes((prev) => [...prev, newStroke]);

    isDrawingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const point = getPoint(event);
    if (mode === "erase") {
      eraseStrokeAtPoint(point);
      return;
    }

    const activeId = activeStrokeIdRef.current;
    if (activeId == null) return;

    setStrokes((prev) =>
      prev.map((stroke) =>
        stroke.id === activeId
          ? { ...stroke, points: [...stroke.points, point] }
          : stroke,
      ),
    );
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = false;
    activeStrokeIdRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const clearAll = () => setStrokes([]);

  const saveResult = async () => {
    if (!clientId) {
      setSaveState("error");
      setSaveMessage("대상자 정보가 없어 저장할 수 없습니다.");
      return;
    }

    setSaveState("saving");
    setSaveMessage("");

    try {
      const response = await fetch(`/api/clients/${clientId}/tests/life-graph`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resultData: {
            strokes: latestStrokesRef.current,
            tool: "canvas",
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

  useEffect(() => {
    redraw(strokes);
  }, [strokes, redraw]);

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("draw")}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              mode === "draw"
                ? "border-slate-700 bg-white text-slate-900"
                : "border-slate-300 bg-white text-slate-700"
            }`}
          >
            ✏️ 그리기
          </button>
          <button
            type="button"
            onClick={() => setMode("erase")}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              mode === "erase"
                ? "border-slate-700 bg-white text-slate-900"
                : "border-slate-300 bg-white text-slate-700"
            }`}
          >
            🧽 지우개
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700"
          >
            전체 지우기
          </button>
          <button
            type="button"
            onClick={saveResult}
            disabled={saveState === "saving"}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saveState === "saving" ? "저장 중..." : "💾 저장"}
          </button>
          <label className="ml-auto flex items-center gap-2 text-sm text-slate-700">
            ✍️ 선 색상
            <input
              type="color"
              value={lineColor}
              onChange={(event) => setLineColor(event.target.value)}
              className="h-7 w-9 rounded border border-slate-300 p-0.5"
            />
          </label>
        </div>
        {saveMessage ? (
          <p className={`mt-2 text-xs ${saveState === "error" ? "text-rose-600" : "text-emerald-600"}`}>
            {saveMessage}
          </p>
        ) : null}
        {saveState === "saved" && clientId ? (
          <Link href={resultHref} className="mt-2 inline-flex text-xs font-semibold text-blue-600 hover:text-blue-700">
            저장된 결과 보기
          </Link>
        ) : null}
      </div>

      <div className="rounded-xl border border-slate-300 bg-white p-1.5 sm:p-2">
        <div
          ref={boardRef}
          className="relative w-full overflow-hidden rounded-md border border-slate-200 aspect-[16/10] lg:aspect-[16/9]"
        >
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 h-full w-full touch-none ${
              mode === "erase" ? "cursor-cell" : "cursor-crosshair"
            }`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
        </div>
      </div>
    </div>
  );
}
