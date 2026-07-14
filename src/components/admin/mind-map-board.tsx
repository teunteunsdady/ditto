"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type ToolMode = "draw" | "erase";
type Point = { x: number; y: number };
type Stroke = { id: number; points: Point[]; color: string; width: number };
type MindMapBoardProps = { clientId?: string };

function normalizeStrokes(value: unknown): Stroke[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const raw = item as { id?: unknown; color?: unknown; width?: unknown; points?: unknown };
      if (!Array.isArray(raw.points)) return null;
      const points = raw.points
        .map((point) => {
          if (!point || typeof point !== "object") return null;
          const casted = point as { x?: unknown; y?: unknown };
          if (typeof casted.x !== "number" || typeof casted.y !== "number") return null;
          return { x: casted.x, y: casted.y };
        })
        .filter((point): point is Point => point !== null);
      if (points.length < 2) return null;
      return {
        id: typeof raw.id === "number" ? raw.id : index + 1,
        color: typeof raw.color === "string" ? raw.color : "#2f2f90",
        width: typeof raw.width === "number" ? raw.width : 3,
        points,
      };
    })
    .filter((stroke): stroke is Stroke => stroke !== null);
}

function drawMindMapTemplate(ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const color = "#3f409f";
  // centerX / centerY: 전체 마인드맵 원의 중심점
  const centerX = width * 0.5;
  const centerY = height * 0.5;
  // 템플릿 전체를 2/3로 축소해 주변 작성 영역을 넓힙니다.
  // 보드 높이를 1.5배로 키워도 템플릿은 이전 비율 기준으로 유지합니다.
  const mapScale = (2 / 3) * scale;
  const sizeBase = Math.min(width, height / 1.5);
  // radius: 가운데 원 반지름, lineLen: 각 가지(선) 길이
  const radius = sizeBase * 0.14 * (2 / 3);
  const lineLen = sizeBase * 0.19 * (2 / 3);
  // labelGap: 선 끝 점과 라벨 텍스트 사이 간격
  const labelGap = 22 * mapScale;

  // 12시(-90도)를 기준으로 19도씩 균등 분할해 19개 항목을 배치합니다.
  const labels = [
    "가족",
    "필요요소",
    "목표",
    "가치관",
    "비전",
    "꿈",
    "종교",
    "사랑",
    "특기",
    "취미",
    "두려움",
    "불행",
    "행복",
    "단점",
    "장점",
    "내가보는 나",
    "남이보는 나",
    "친구",
    "학교",
  ] as const;
  const baseAngleDeg = -90;
  const stepAngleDeg = 19;
  const nodes = labels.map((text, index) => ({
    text,
    angleDeg: baseAngleDeg + index * stepAngleDeg,
  }));

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8 * mapScale;
  ctx.fillStyle = color;
  ctx.font = `700 ${Math.max(12, 26 * mapScale)}px sans-serif`;
  ctx.textBaseline = "middle";

  // 1) 중심 원 -> 바깥으로 뻗는 선 + 끝 점(도트) 렌더링
  nodes.forEach((node) => {
    const angle = (node.angleDeg * Math.PI) / 180;
    const ux = Math.cos(angle);
    const uy = Math.sin(angle);
    const sx = centerX + ux * radius;
    const sy = centerY + uy * radius;
    const ex = centerX + ux * (radius + lineLen);
    const ey = centerY + uy * (radius + lineLen);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(ex, ey, 3.2 * mapScale, 0, Math.PI * 2);
    ctx.fill();
  });

  // 2) 선 방향 벡터(ux, uy) 그대로 사용해 각 라벨을 선 끝 바깥쪽으로 배치
  const extraLabelGapByText = new Set(["불행", "두려움", "취미"]);
  nodes.forEach((node) => {
    const angle = (node.angleDeg * Math.PI) / 180;
    const ux = Math.cos(angle);
    const uy = Math.sin(angle);
    const ex = centerX + ux * (radius + lineLen);
    const ey = centerY + uy * (radius + lineLen);
    const extraGap = extraLabelGapByText.has(node.text) ? 10 * mapScale : 0;
    const tx = ex + ux * (labelGap + extraGap);
    const ty = ey + uy * (labelGap + extraGap);

    // 좌/우/상하 영역에 따라 textAlign을 바꿔 겹침을 줄입니다.
    if (ux > 0.25) {
      ctx.textAlign = "left";
    } else if (ux < -0.25) {
      ctx.textAlign = "right";
    } else {
      ctx.textAlign = "center";
    }
    ctx.fillText(node.text, tx, ty);
  });

  ctx.strokeStyle = color;
  ctx.lineWidth = 6 * mapScale;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();
}

export function MindMapBoard({ clientId }: MindMapBoardProps) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dpiScaleRef = useRef(1);
  const isDrawingRef = useRef(false);
  const activeStrokeIdRef = useRef<number | null>(null);
  const strokeIdRef = useRef(1);
  const latestStrokesRef = useRef<Stroke[]>([]);

  const [mode, setMode] = useState<ToolMode>("draw");
  const [lineColor, setLineColor] = useState("#2f2f90");
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const resultHref = clientId ? `/admin/clients/curriculum/mind-map/result?clientId=${clientId}` : "";

  useEffect(() => {
    latestStrokesRef.current = strokes;
  }, [strokes]);

  useEffect(() => {
    if (!clientId) return;
    const controller = new AbortController();
    const loadSavedResult = async () => {
      try {
        const response = await fetch(`/api/clients/${clientId}/tests/mind-map`, { signal: controller.signal });
        const payload = (await response.json().catch(() => null)) as
          | { item?: { resultData?: { strokes?: unknown } | null } | null }
          | null;
        if (!response.ok || !payload?.item?.resultData) return;
        const savedStrokes = normalizeStrokes(payload.item.resultData.strokes);
        setStrokes(savedStrokes);
        const maxId = savedStrokes.reduce((max, stroke) => Math.max(max, stroke.id), 0);
        strokeIdRef.current = maxId + 1;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    };
    void loadSavedResult();
    return () => controller.abort();
  }, [clientId]);

  const drawStrokes = useCallback((ctx: CanvasRenderingContext2D, targetStrokes: Stroke[], scale: number) => {
    targetStrokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
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
    drawMindMapTemplate(ctx, width * scale, height * scale, scale);
    drawStrokes(ctx, targetStrokes, scale);
  }, [drawStrokes]);

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

  useEffect(() => {
    redraw(strokes);
  }, [strokes, redraw]);

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const distancePointToSegment = (point: Point, a: Point, b: Point) => {
    const vx = b.x - a.x;
    const vy = b.y - a.y;
    const wx = point.x - a.x;
    const wy = point.y - a.y;
    const c1 = vx * wx + vy * wy;
    if (c1 <= 0) return Math.hypot(point.x - a.x, point.y - a.y);
    const c2 = vx * vx + vy * vy;
    if (c2 <= c1) return Math.hypot(point.x - b.x, point.y - b.y);
    const t = c1 / c2;
    const px = a.x + t * vx;
    const py = a.y + t * vy;
    return Math.hypot(point.x - px, point.y - py);
  };

  const eraseStrokeAtPoint = (point: Point) => {
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
    if (nearestId != null && minDistance <= threshold) {
      setStrokes((prev) => prev.filter((stroke) => stroke.id !== nearestId));
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = getPoint(event);
    if (mode === "erase") {
      isDrawingRef.current = true;
      eraseStrokeAtPoint(point);
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }
    const newStroke: Stroke = { id: strokeIdRef.current++, points: [point], color: lineColor, width: 3 };
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
        stroke.id === activeId ? { ...stroke, points: [...stroke.points, point] } : stroke,
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

  const saveResult = async () => {
    if (!clientId) {
      setSaveState("error");
      setSaveMessage("대상자 정보가 없어 저장할 수 없습니다.");
      return;
    }
    setSaveState("saving");
    setSaveMessage("");
    try {
      const response = await fetch(`/api/clients/${clientId}/tests/mind-map`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultData: { strokes: latestStrokesRef.current, tool: "canvas" } }),
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
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setMode("draw")} className={`rounded-md border px-3 py-1.5 text-sm ${mode === "draw" ? "border-[#2f4f46] bg-[#edf3ef] text-[#1f3a33]" : "border-slate-300 text-slate-700"}`}>✏️ 그리기</button>
          <button type="button" onClick={() => setMode("erase")} className={`rounded-md border px-3 py-1.5 text-sm ${mode === "erase" ? "border-[#2f4f46] bg-[#edf3ef] text-[#1f3a33]" : "border-slate-300 text-slate-700"}`}>🧽 지우개</button>
          <button type="button" onClick={() => setStrokes([])} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700">전체 지우기</button>
          <button type="button" onClick={saveResult} disabled={saveState === "saving"} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-60">{saveState === "saving" ? "저장 중..." : "💾 저장"}</button>
          <label className="flex w-full items-center justify-end gap-2 text-sm text-slate-700 sm:ml-auto sm:w-auto">
            🎨 선 색상
            <input type="color" value={lineColor} onChange={(event) => setLineColor(event.target.value)} className="h-7 w-9 rounded border border-slate-300 p-0.5" />
          </label>
        </div>
        {saveMessage ? <p className={`mt-2 text-xs ${saveState === "error" ? "text-rose-600" : "text-emerald-600"}`}>{saveMessage}</p> : null}
        {saveState === "saved" && clientId ? <Link href={resultHref} className="mt-2 inline-flex text-xs font-semibold text-[#2f4f46] hover:text-[#1f3a33]">저장된 결과 보기</Link> : null}
      </div>

      <div className="rounded-xl border border-slate-300 bg-white p-1.5 sm:p-2">
        <div ref={boardRef} className="relative w-full overflow-hidden rounded-md border border-slate-200 aspect-[16/15] lg:aspect-[32/27]">
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 h-full w-full touch-none ${mode === "erase" ? "cursor-cell" : "cursor-crosshair"}`}
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
