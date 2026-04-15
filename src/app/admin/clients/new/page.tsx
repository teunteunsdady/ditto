"use client";

import { type PointerEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewClientPage() {
  const [agreed, setAgreed] = useState(false);
  const [writtenDate, setWrittenDate] = useState("");
  const [isSigned, setIsSigned] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    setWrittenDate(
      new Date().toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    );
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const resizeCanvas = () => {
      const parentWidth = canvas.parentElement?.clientWidth ?? 600;
      const cssHeight = parentWidth < 480 ? 180 : 220;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = parentWidth * dpr;
      canvas.height = cssHeight * dpr;
      canvas.style.width = `${parentWidth}px`;
      canvas.style.height = `${cssHeight}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#1f2937";
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  const getPoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const point = getPoint(event);
    isDrawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    setIsSigned(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) {
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    const point = getPoint(event);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const handlePointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsSigned(false);
  };

  const isDisabled = !agreed || !isSigned;

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-10">
        <h1 className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl">비밀 유지 서약서</h1>
        <p className="mt-6 text-sm font-medium sm:mt-8 sm:text-base">
          본인은 아래의 조항을 충분히 이해하고 이에 동의하며 서명합니다.
        </p>

        <ol className="mt-5 space-y-3 text-base leading-relaxed sm:mt-6 sm:space-y-4 sm:text-lg">
          <li>
            <span className="font-bold">1. 계약 목적:</span> 상담자는 내담자의 동의 없이 상담 내용을 외부에
            공개하지 않습니다.
          </li>
          <li>
            <span className="font-bold">2. 영업 비밀 정보:</span> 교육, 연구, 평가 중 알게 된 비밀 정보는 외부에
            유출하지 않습니다.
          </li>
          <li>
            <span className="font-bold">3. 보유 정보 사용 제한:</span> 내담자 연구 시에는 참여 거부나 중단 시
            해로운 결과가 없도록 보호합니다.
          </li>
          <li>
            <span className="font-bold">4. 비밀 유지 기간:</span> 본 프로그램의 내용을 외부에 누설하지 않으며,
            저작권 침해 시 법적 책임을 집니다.
          </li>
        </ol>

        <label className="mt-8 flex items-start gap-3 text-base sm:mt-10 sm:text-lg">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 rounded border-gray-300"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
          />
          <span>상기 내용을 충분히 읽고 이해하였으며 이에 동의합니다.</span>
        </label>

        <p className="mt-8 text-xl font-semibold sm:mt-10 sm:text-2xl">작성일: {writtenDate}</p>

        <div className="mt-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label className="text-xl font-semibold sm:text-2xl">서명:</label>
            <button
              type="button"
              onClick={handleClearSignature}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              서명 지우기
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">아래 칸에 마우스 또는 터치로 서명해주세요.</p>
          <div className="mt-3 w-full rounded-md border border-gray-300 bg-white">
            <canvas
              ref={canvasRef}
              className="touch-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            />
          </div>
        </div>
      </section>

      <button
        type="button"
        disabled={isDisabled}
        onClick={() => router.push("/admin/clients/new/details")}
        className="mt-6 w-full rounded-md bg-[#2f4f46] px-4 py-3 text-lg font-bold text-white hover:bg-[#223c35] sm:mt-8 sm:py-4 sm:text-xl disabled:cursor-not-allowed disabled:bg-[#9aa9a3]"
      >
        서약서 동의 및 다음
      </button>
    </main>
  );
}
