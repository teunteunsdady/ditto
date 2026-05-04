"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ClientRow = {
  id: string;
  name: string;
  stressFactor: string;
  location: string;
  createdAt: string;
  deletedAt?: string | null;
};

type ClientProfile = {
  id: string;
  name: string;
  birthDate: string;
  phone: string;
  stressFactor: string;
  location: string;
  privacyConsent: boolean;
  privacyConsentedAt?: string | null;
  createdAt: string;
};

type AccessLogMeta = {
  viewedBy: string;
  reason: string;
  viewedAt: string;
};

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 30];
type ViewMode = "active" | "deleted";
type AccessAction = "details_view";

function maskName(name: string) {
  if (name.length <= 1) {
    return name;
  }
  if (name.length === 2) {
    return `${name[0]}*`;
  }
  return `${name[0]}${"*".repeat(name.length - 2)}${name[name.length - 1]}`;
}

function formatKoreanDate(isoDate: string) {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }
  return parsed.toLocaleDateString("ko-KR");
}

export function ClientsListTable() {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 8 }, (_, idx) => currentYear - idx);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("active");
  const [displayMode, setDisplayMode] = useState<ViewMode>("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false);
  const [isAccessSubmitting, setIsAccessSubmitting] = useState(false);
  const [viewerName, setViewerName] = useState("");
  const [accessReason, setAccessReason] = useState("");
  const [accessError, setAccessError] = useState("");
  const [pendingAccess, setPendingAccess] = useState<{
    clientId: string;
    action: AccessAction;
  } | null>(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ClientProfile | null>(null);
  const [lastAccessLog, setLastAccessLog] = useState<AccessLogMeta | null>(null);
  const [profileError, setProfileError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadClients = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          pageSize: String(pageSize),
          search,
          status: viewMode,
        });
        if (filterYear && filterMonth) {
          params.set("year", filterYear);
          params.set("month", filterMonth);
        }

        const response = await fetch(`/api/clients?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
        });
        const result = (await response.json()) as {
          message?: string;
          items?: ClientRow[];
          totalCount?: number;
        };

        if (!response.ok) {
          setErrorMessage(result.message ?? "대상자 목록을 불러오지 못했습니다.");
          return;
        }

        setClients(result.items ?? []);
        setTotalCount(result.totalCount ?? 0);
        setDisplayMode(viewMode);
      } catch {
        setErrorMessage("대상자 목록 조회 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadClients();
  }, [currentPage, filterMonth, filterYear, pageSize, search, reloadKey, viewMode]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / pageSize)),
    [pageSize, totalCount],
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const visibleFrom = totalCount === 0 ? 0 : startIndex + 1;
  const visibleTo = Math.min(startIndex + pageSize, totalCount);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!filterYear && filterMonth) {
      setFilterMonth("");
    }
  }, [filterMonth, filterYear]);

  const openAccessDialog = (clientId: string, action: AccessAction) => {
    setViewerName("");
    setAccessReason("");
    setAccessError("");
    setProfileError("");
    setLastAccessLog(null);
    setPendingAccess({ clientId, action });
    setIsAccessDialogOpen(true);
  };

  const logAndProceedAccess = async () => {
    if (!pendingAccess) {
      return;
    }

    const normalizedViewerName = viewerName.trim();
    if (normalizedViewerName.length < 2) {
      setAccessError("열람자 이름은 2자 이상 입력해주세요.");
      return;
    }

    const reason = accessReason.trim();
    if (reason.length < 5) {
      setAccessError("열람 사유는 5자 이상 입력해주세요.");
      return;
    }

    setAccessError("");
    setIsAccessSubmitting(true);
    try {
      const viewedFields = ["name", "birth_date", "phone", "stress_factor", "location"];
      const response = await fetch(`/api/clients/${pendingAccess.clientId}/access-logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          viewerName: normalizedViewerName,
          reason,
          action: pendingAccess.action,
          viewedFields,
        }),
      });

      const result = (await response.json()) as {
        message?: string;
        log?: {
          viewedBy?: string;
          reason?: string;
          viewedAt?: string;
        };
      };
      if (!response.ok) {
        setAccessError(result.message ?? "접근 로그 저장에 실패했습니다.");
        return;
      }

      const profileResponse = await fetch(`/api/clients/${pendingAccess.clientId}/profile`, {
        method: "GET",
        cache: "no-store",
      });
      const profileResult = (await profileResponse.json()) as {
        message?: string;
        item?: ClientProfile;
      };
      if (!profileResponse.ok || !profileResult.item) {
        setAccessError(profileResult.message ?? "개인정보를 불러오지 못했습니다.");
        return;
      }

      setIsAccessDialogOpen(false);
      setLastAccessLog({
        viewedBy: result.log?.viewedBy ?? "unknown",
        reason: result.log?.reason ?? reason,
        viewedAt: result.log?.viewedAt ?? new Date().toISOString(),
      });
      setSelectedProfile(profileResult.item);
      setIsProfileDialogOpen(true);
      setPendingAccess(null);
      setViewerName("");
      setAccessReason("");
    } catch {
      setAccessError("접근 로그 저장 중 오류가 발생했습니다.");
    } finally {
      setIsAccessSubmitting(false);
    }
  };

  const handleDelete = async (clientId: string, permanent = false) => {
    const confirmed = window.confirm(
      permanent
        ? "영구 삭제하면 복구할 수 없습니다. 계속할까요?"
        : "이 대상자를 종료 대상자 보관함으로 이동할까요?",
    );
    if (!confirmed) {
      return;
    }

    setDeletingId(clientId);
    setErrorMessage("");

    try {
      const query = permanent ? "?permanent=true" : "";
      const response = await fetch(`/api/clients/${clientId}${query}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        setErrorMessage(result.message ?? "대상자 삭제에 실패했습니다.");
        return;
      }
      setReloadKey((prev) => prev + 1);
    } catch {
      setErrorMessage("대상자 삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRestore = async (clientId: string) => {
    setDeletingId(clientId);
    setErrorMessage("");
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "restore" }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) {
        setErrorMessage(result.message ?? "대상자 복구에 실패했습니다.");
        return;
      }
      setReloadKey((prev) => prev + 1);
    } catch {
      setErrorMessage("대상자 복구 중 오류가 발생했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-gray-300 bg-white">
      <div className="border-b border-gray-200 p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setErrorMessage("");
              setViewMode("active");
              setCurrentPage(1);
            }}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
              viewMode === "active"
                ? "bg-[#2f4f46] text-white"
                : "border border-gray-300 text-gray-600"
            }`}
          >
            목록 보기
          </button>
          <button
            type="button"
            onClick={() => {
              setErrorMessage("");
              setViewMode("deleted");
              setCurrentPage(1);
            }}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
              viewMode === "deleted"
                ? "bg-slate-700 text-white"
                : "border border-gray-300 text-gray-600"
            }`}
          >
            종료 대상자 보관함
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-800">이름 검색</span>
            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="이름을 입력하세요."
              className="h-11 w-full max-w-md rounded-md border border-gray-300 px-4 text-sm focus:border-[#2f4f46] focus:outline-none"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setShowDateFilter((prev) => {
                  const next = !prev;
                  if (!next) {
                    setFilterYear("");
                    setFilterMonth("");
                    setCurrentPage(1);
                  }
                  return next;
                });
              }}
              className="inline-flex h-8 items-center rounded-md border border-gray-300 bg-white px-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              {showDateFilter ? "검색조건 숨기기" : "검색조건 입력"}
            </button>
            {showDateFilter ? (
              <>
                <label className="inline-flex items-center gap-2">
                  연도
                  <select
                    value={filterYear}
                    onChange={(event) => {
                      setFilterYear(event.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs text-gray-700 focus:border-[#2f4f46] focus:outline-none"
                  >
                    <option value="">전체</option>
                    {yearOptions.map((year) => (
                      <option key={year} value={String(year)}>
                        {year}년
                      </option>
                    ))}
                  </select>
                </label>
                <label className="inline-flex items-center gap-2">
                  월
                  <select
                    value={filterMonth}
                    onChange={(event) => {
                      setFilterMonth(event.target.value);
                      setCurrentPage(1);
                    }}
                    disabled={!filterYear}
                    className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs text-gray-700 focus:border-[#2f4f46] focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">전체</option>
                    {Array.from({ length: 12 }, (_, idx) => idx + 1).map((month) => (
                      <option key={month} value={String(month)}>
                        {month}월
                      </option>
                    ))}
                  </select>
                </label>
              </>
            ) : null}
            <label className="inline-flex items-center gap-2">
              페이지당 표시
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setCurrentPage(1);
                }}
                className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs text-gray-700 focus:border-[#2f4f46] focus:outline-none"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}개
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          목록에서는 이름만 마스킹해 표시하고, 상세 버튼에서 사유 입력 후 개인정보를 열람할 수 있습니다.
        </p>
        {errorMessage ? <p className="mt-2 text-xs text-rose-600">{errorMessage}</p> : null}
      </div>

      <div className="overflow-x-auto">
        <div className="relative">
          <table className="min-w-[760px] w-full border-collapse text-sm">
          <thead className="bg-slate-100 text-left text-slate-900">
            <tr>
              <th className="px-4 py-3 font-semibold">이름</th>
              <th className="px-4 py-3 font-semibold">스트레스 요인</th>
              <th className="px-4 py-3 font-semibold">사는 곳</th>
              <th className="px-4 py-3 font-semibold">등록일</th>
              <th className="px-4 py-3 font-semibold">관리</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => {
              return (
                <tr key={client.id} className="border-t border-gray-200">
                  <td className="px-4 py-3 font-semibold text-gray-800">{maskName(client.name)}</td>
                  <td className="px-4 py-3">{client.stressFactor || "-"}</td>
                  <td className="px-4 py-3">{client.location || "-"}</td>
                  <td className="px-4 py-3">{formatKoreanDate(client.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {displayMode === "active" ? (
                        <>
                          <Link
                            href={`/admin/clients/curriculum?clientId=${client.id}`}
                            className="rounded-md border border-[#2f4f46] px-3 py-1.5 text-xs font-semibold text-[#2f4f46] hover:bg-[#eef4f1]"
                          >
                            커리큘럼
                          </Link>
                          <button
                            type="button"
                            onClick={() => openAccessDialog(client.id, "details_view")}
                            className="rounded-md bg-[#2f4f46] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#223c35]"
                          >
                            상세
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(client.id)}
                            disabled={deletingId === client.id}
                            className="rounded-md bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-rose-300"
                          >
                            {deletingId === client.id ? "처리 중..." : "삭제"}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleRestore(client.id)}
                            disabled={deletingId === client.id}
                            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                          >
                            {deletingId === client.id ? "처리 중..." : "복구"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(client.id, true)}
                            disabled={deletingId === client.id}
                            className="rounded-md bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                          >
                            영구삭제
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!isLoading && clients.length === 0 ? (
              <tr className="border-t border-gray-200">
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : null}
          </tbody>
          </table>

          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/65 backdrop-blur-[1px]">
              <p className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
                목록을 불러오는 중...
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4 py-4 sm:px-6">
        <p className="text-xs text-gray-500">
          총 {totalCount}명 중 {visibleFrom}-{visibleTo}명 표시
        </p>
        <div className="flex max-w-full items-center gap-1 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={safePage === 1 || isLoading}
            className="rounded border border-gray-300 px-2.5 py-1.5 text-xs disabled:opacity-40"
          >
            이전
          </button>
          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              disabled={isLoading}
              className={`rounded px-2.5 py-1.5 text-xs ${
                safePage === page
                  ? "bg-gray-900 text-white"
                  : "border border-gray-300 text-gray-700"
              } disabled:opacity-50`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={safePage === totalPages || isLoading}
            className="rounded border border-gray-300 px-2.5 py-1.5 text-xs disabled:opacity-40"
          >
            다음
          </button>
        </div>
      </div>

      <Dialog
        open={isAccessDialogOpen}
        onOpenChange={(open) => {
          setIsAccessDialogOpen(open);
          if (!open) {
            setViewerName("");
            setAccessReason("");
            setAccessError("");
            setPendingAccess(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>개인정보 열람 사유 입력</DialogTitle>
            <DialogDescription>
              개인정보 접근 로그에 열람자, 시각, 사유가 함께 저장됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-800">
              열람자 이름
              <input
                type="text"
                value={viewerName}
                onChange={(event) => setViewerName(event.target.value)}
                placeholder="예: 홍길동 상담사"
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#2f4f46] focus:outline-none"
              />
            </label>
            <label className="block text-sm font-medium text-slate-800">
              열람 사유
              <textarea
                value={accessReason}
                onChange={(event) => setAccessReason(event.target.value)}
                rows={3}
                placeholder="예: 상담 일정 확인을 위한 대상자 정보 확인"
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#2f4f46] focus:outline-none"
              />
            </label>
            {accessError ? <p className="text-xs text-rose-600">{accessError}</p> : null}
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsAccessDialogOpen(false)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={logAndProceedAccess}
              disabled={isAccessSubmitting}
              className="rounded-md bg-[#2f4f46] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223c35] disabled:cursor-not-allowed disabled:bg-[#9aa9a3]"
            >
              {isAccessSubmitting ? "기록 중..." : "기록 후 열람"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isProfileDialogOpen}
        onOpenChange={(open) => {
          setIsProfileDialogOpen(open);
          if (!open) {
            setSelectedProfile(null);
            setLastAccessLog(null);
            setProfileError("");
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>수강생 개인정보 상세</DialogTitle>
            <DialogDescription>
              접근 로그가 기록된 후 조회된 상세 정보입니다.
            </DialogDescription>
          </DialogHeader>
          {selectedProfile ? (
            <div className="space-y-2 text-sm text-slate-700">
              {lastAccessLog ? (
                <div className="mb-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700">
                  <p>
                    <span className="font-semibold text-slate-900">열람자:</span> {lastAccessLog.viewedBy}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">열람 시각:</span>{" "}
                    {new Date(lastAccessLog.viewedAt).toLocaleString("ko-KR")}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">열람 사유:</span> {lastAccessLog.reason}
                  </p>
                </div>
              ) : null}
              <p>
                <span className="font-semibold text-slate-900">이름:</span> {selectedProfile.name}
              </p>
              <p>
                <span className="font-semibold text-slate-900">생년월일:</span> {selectedProfile.birthDate}
              </p>
              <p>
                <span className="font-semibold text-slate-900">휴대번호:</span> {selectedProfile.phone}
              </p>
              <p>
                <span className="font-semibold text-slate-900">스트레스 요인:</span>{" "}
                {selectedProfile.stressFactor}
              </p>
              <p>
                <span className="font-semibold text-slate-900">사는곳(동):</span> {selectedProfile.location}
              </p>
              <p>
                <span className="font-semibold text-slate-900">개인정보 동의:</span>{" "}
                {selectedProfile.privacyConsent ? "동의" : "미동의"}
              </p>
              <p>
                <span className="font-semibold text-slate-900">동의 시각:</span>{" "}
                {selectedProfile.privacyConsentedAt
                  ? new Date(selectedProfile.privacyConsentedAt).toLocaleString("ko-KR")
                  : "-"}
              </p>
            </div>
          ) : (
            <p className="text-sm text-rose-600">
              {profileError || "상세 정보를 불러오지 못했습니다."}
            </p>
          )}
          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsProfileDialogOpen(false)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              닫기
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
