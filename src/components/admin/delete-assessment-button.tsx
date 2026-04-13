"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteAssessmentButtonProps = {
  clientId: string;
  testSlug: string;
  redirectHref: string;
};

export function DeleteAssessmentButton({
  clientId,
  testSlug,
  redirectHref,
}: DeleteAssessmentButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "제출한 검사 결과를 삭제할까요? 삭제 후에는 다시 입력해야 합니다.",
    );
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage("");
    try {
      const response = await fetch(`/api/clients/${clientId}/tests/${testSlug}`, {
        method: "DELETE",
      });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.message ?? "삭제에 실패했습니다.");
      }

      router.push(redirectHref);
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
      >
        {isDeleting ? "삭제 중..." : "제출 내용 삭제"}
      </button>
      {errorMessage ? <p className="text-xs text-rose-600">{errorMessage}</p> : null}
    </div>
  );
}
