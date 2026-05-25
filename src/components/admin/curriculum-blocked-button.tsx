"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CurriculumBlockedButtonProps = {
  label: string;
  className: string;
};

export function CurriculumBlockedButton({ label, className }: CurriculumBlockedButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={className}
      >
        {label}
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>마인드맵 접근 제한</DialogTitle>
            <DialogDescription>
              현재 마인드맵 커리큘럼은 점검 중입니다. 점검이 완료될 때까지 접근할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center rounded-md bg-[#2f4f46] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223c35]"
            >
              확인
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
