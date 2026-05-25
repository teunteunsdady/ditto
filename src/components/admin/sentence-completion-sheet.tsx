"use client";

import Link from "next/link";
import {
  type MouseEvent,
  type PointerEvent,
  type TouchEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type SentenceCompletionSheetProps = {
  clientId?: string;
  testSlug: string;
};

type AnswerMap = Record<number, string>;
type HandwritingMap = Record<number, string>;
type SentencePrompt = { no: number; text: string };

const SENTENCE_PROMPTS: SentencePrompt[] = [
  { no: 1, text: "나에게 이상한 일이 생겼을 때" },
  { no: 2, text: "내 생각에 가끔 아버지는" },
  { no: 3, text: "우리 윗사람들은" },
  { no: 4, text: "나의 장래는" },
  { no: 5, text: "어리석게도 내가 두려워하는 것은" },
  { no: 6, text: "내 생각에 참다운 친구는" },
  { no: 7, text: "내가 어렸을 때는" },
  { no: 8, text: "남자에 대해서 무엇보다 좋지 않게 생각하는 것은" },
  { no: 9, text: "내가 바라는 여인상은" },
  { no: 10, text: "남녀가 같이 있는 것을 볼 때" },
  { no: 11, text: "내가 늘 원하기는" },
  { no: 12, text: "다른 가정과 비교해서 우리 집안은" },
  { no: 13, text: "나의 어머니는" },
  { no: 14, text: "무슨 일을 해서라도 잊고 싶은 것은" },
  { no: 15, text: "내가 믿고 있는 내 능력은" },
  { no: 16, text: "내가 정말 행복할 수 있으려면" },
  { no: 17, text: "어렸을 때 잘못했다고 느끼는 것은" },
  { no: 18, text: "내가 보는 나의 앞날은" },
  { no: 19, text: "대개 아버지들이란" },
  { no: 20, text: "내 생각에 남자들이랑" },
  { no: 21, text: "다른 친구들이 모르는 나만의 두려움은" },
  { no: 22, text: "내가 싫어하는 사람은" },
  { no: 23, text: "결혼 생활에 대한 나의 생각은" },
  { no: 24, text: "우리 가족이 나에 대해서" },
  { no: 25, text: "내 생각에 여자들이란" },
  { no: 26, text: "어머니와 나는" },
  { no: 27, text: "내가 저지른 가장 큰 잘못을" },
  { no: 28, text: "언젠가 나는" },
  { no: 29, text: "내가 바라기에 아버지는" },
  { no: 30, text: "나의 야망은" },
  { no: 31, text: "윗사람이 오는 것을 보면 나는" },
  { no: 32, text: "내가 제일 좋아하는 사람은" },
  { no: 33, text: "내가 다시 젊어진다면" },
  { no: 34, text: "나의 가장 큰 결점은" },
  { no: 35, text: "내가 아는 대부분의 집안은" },
  { no: 36, text: "완전한 남성상은" },
  { no: 37, text: "행운이 나를 외면했을 때" },
  { no: 38, text: "대개 어머니들이란" },
  { no: 39, text: "내가 잊고 싶은 두려움은" },
  { no: 40, text: "내가 평생 가장 하고 싶은 일은" },
  { no: 41, text: "내가 늙으면" },
  { no: 42, text: "때때로 두려운 생각이 나를 휩쌀 때" },
  { no: 43, text: "내가 없을 때 친구들은" },
  { no: 44, text: "생생한 어린 시절의 기억은" },
  { no: 45, text: "무엇보다도 좋지 않게 여기는 것은" },
  { no: 46, text: "내가 어렸을 때 우리 가족은" },
  { no: 47, text: "나의 어머니를 좋아했지만" },
  { no: 48, text: "아버지와 나는" },
];

function normalizeAnswerMap(value: unknown): AnswerMap {
  if (!value || typeof value !== "object") return {};
  return Object.entries(value as Record<string, unknown>).reduce<AnswerMap>((acc, [key, raw]) => {
    const no = Number(key);
    if (!Number.isFinite(no) || typeof raw !== "string") return acc;
    acc[no] = raw;
    return acc;
  }, {});
}

function normalizeHandwritingMap(value: unknown): HandwritingMap {
  if (!value || typeof value !== "object") return {};
  return Object.entries(value as Record<string, unknown>).reduce<HandwritingMap>((acc, [key, raw]) => {
    const no = Number(key);
    if (!Number.isFinite(no) || typeof raw !== "string") return acc;
    acc[no] = raw;
    return acc;
  }, {});
}

function drawPadBackground(ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1 * scale;
  const gap = 24 * scale;
  for (let y = gap; y < height; y += gap) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

type HandwritingPadProps = {
  value: string;
  onChange: (next: string) => void;
};

function HandwritingPad({ value, onChange }: HandwritingPadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = window.devicePixelRatio || 1;
    const width = wrap.clientWidth;
    const height = 130;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawPadBackground(ctx, canvas.width, canvas.height, dpr);

    if (value) {
      const image = new Image();
      image.onload = () => {
        drawPadBackground(ctx, canvas.width, canvas.height, dpr);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      };
      image.src = value;
    }
  }, [value]);

  const getPoint = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    return {
      x: (clientX - rect.left) * dpr,
      y: (clientY - rect.top) * dpr,
    };
  };

  const beginStroke = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const point = getPoint(clientX, clientY);
    isDrawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2.4 * (window.devicePixelRatio || 1);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  const continueStroke = (clientX: number, clientY: number) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const point = getPoint(clientX, clientY);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const finishStroke = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL("image/png"));
  };

  const startPointerDraw = (event: PointerEvent<HTMLCanvasElement>) => {
    beginStroke(event.clientX, event.clientY);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const movePointerDraw = (event: PointerEvent<HTMLCanvasElement>) => {
    continueStroke(event.clientX, event.clientY);
  };

  const endPointerDraw = (event: PointerEvent<HTMLCanvasElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    finishStroke();
  };

  const startTouchDraw = (event: TouchEvent<HTMLCanvasElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    event.preventDefault();
    beginStroke(touch.clientX, touch.clientY);
  };

  const moveTouchDraw = (event: TouchEvent<HTMLCanvasElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    event.preventDefault();
    continueStroke(touch.clientX, touch.clientY);
  };

  const endTouchDraw = (event: TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    finishStroke();
  };

  const startMouseDraw = (event: MouseEvent<HTMLCanvasElement>) => {
    beginStroke(event.clientX, event.clientY);
  };

  const moveMouseDraw = (event: MouseEvent<HTMLCanvasElement>) => {
    continueStroke(event.clientX, event.clientY);
  };

  const endMouseDraw = () => {
    finishStroke();
  };

  const clearPad = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    drawPadBackground(ctx, canvas.width, canvas.height, window.devicePixelRatio || 1);
    onChange("");
  };

  return (
    <div className="space-y-2">
      <div ref={wrapRef} className="w-full overflow-hidden rounded-md border border-slate-300 bg-white">
        <canvas
          ref={canvasRef}
          className="touch-none"
          onPointerDown={startPointerDraw}
          onPointerMove={movePointerDraw}
          onPointerUp={endPointerDraw}
          onPointerLeave={endPointerDraw}
          onPointerCancel={endPointerDraw}
          onTouchStart={startTouchDraw}
          onTouchMove={moveTouchDraw}
          onTouchEnd={endTouchDraw}
          onMouseDown={startMouseDraw}
          onMouseMove={moveMouseDraw}
          onMouseUp={endMouseDraw}
          onMouseLeave={endMouseDraw}
        />
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={clearPad}
          className="rounded-md border border-gray-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
        >
          필기 지우기
        </button>
      </div>
    </div>
  );
}

export function SentenceCompletionSheet({ clientId, testSlug }: SentenceCompletionSheetProps) {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [handwrittenAnswers, setHandwrittenAnswers] = useState<HandwritingMap>({});
  const [isTouchInputMode, setIsTouchInputMode] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const resultHref = clientId ? `/admin/clients/curriculum/${testSlug}/result?clientId=${clientId}` : "";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(pointer: coarse)");
    const mobileViewport = window.matchMedia("(max-width: 1024px)");
    const detect = () => {
      const shouldUseHandwritingMode =
        media.matches ||
        mobileViewport.matches ||
        "ontouchstart" in window ||
        (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0);
      setIsTouchInputMode(shouldUseHandwritingMode);
    };
    detect();
    media.addEventListener("change", detect);
    mobileViewport.addEventListener("change", detect);
    window.addEventListener("resize", detect);
    return () => {
      media.removeEventListener("change", detect);
      mobileViewport.removeEventListener("change", detect);
      window.removeEventListener("resize", detect);
    };
  }, []);

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
        setHandwrittenAnswers(
          normalizeHandwritingMap(
            (payload.item.resultData as { handwrittenAnswers?: unknown }).handwrittenAnswers,
          ),
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    };

    void loadSavedResult();
    return () => controller.abort();
  }, [clientId, testSlug]);

  const answeredCount = useMemo(
    () =>
      SENTENCE_PROMPTS.filter((prompt) => {
        if (isTouchInputMode) {
          const handwritingValue = handwrittenAnswers[prompt.no];
          return typeof handwritingValue === "string" && handwritingValue.length > 0;
        }
        const value = answers[prompt.no];
        return typeof value === "string" && value.trim().length > 0;
      }).length,
    [answers, handwrittenAnswers, isTouchInputMode],
  );

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
            prompts: SENTENCE_PROMPTS,
            answers: isTouchInputMode ? {} : answers,
            handwrittenAnswers: isTouchInputMode ? handwrittenAnswers : {},
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
    <div className="mt-8 space-y-4">
      <div className="space-y-3 rounded-xl border border-slate-300 bg-white p-4 sm:p-6">
        {SENTENCE_PROMPTS.map((prompt) => {
          const no = prompt.no;
          return (
            <label key={no} className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-800">
                {no}. {prompt.text}
              </span>
              {isTouchInputMode ? (
                <>
                  <p className="mb-2 text-xs text-slate-500">아래 필기 패드에 펜/손가락으로 작성해주세요.</p>
                  <HandwritingPad
                    value={handwrittenAnswers[no] ?? ""}
                    onChange={(next) => {
                      setHandwrittenAnswers((prev) => ({ ...prev, [no]: next }));
                    }}
                  />
                </>
              ) : (
                <textarea
                  value={answers[no] ?? ""}
                  onChange={(event) => {
                    const next = event.target.value;
                    setAnswers((prev) => ({ ...prev, [no]: next }));
                  }}
                  rows={3}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#2f4f46] focus:outline-none"
                  placeholder="문장을 완성해 입력해주세요."
                />
              )}
            </label>
          );
        })}
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
            작성 {answeredCount} / {SENTENCE_PROMPTS.length}
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
