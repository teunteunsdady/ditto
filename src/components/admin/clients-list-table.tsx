"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ClientRow = {
  id: string;
  name: string;
  birthDate: string;
  stressFactor: string;
  location: string;
  createdAt: string;
  deletedAt?: string | null;
};

const PAGE_SIZE = 6;
type ViewMode = "active" | "deleted";

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
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("active");
  const [displayMode, setDisplayMode] = useState<ViewMode>("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [revealedNames, setRevealedNames] = useState<Record<string, boolean>>({});
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadClients = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          pageSize: String(PAGE_SIZE),
          search,
          status: viewMode,
        });

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
  }, [currentPage, search, reloadKey, viewMode]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    [totalCount],
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const visibleFrom = totalCount === 0 ? 0 : startIndex + 1;
  const visibleTo = Math.min(startIndex + PAGE_SIZE, totalCount);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const toggleName = (clientId: string) => {
    setRevealedNames((prev) => ({
      ...prev,
      [clientId]: !prev[clientId],
    }));
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

      setRevealedNames((prev) => {
        const next = { ...prev };
        delete next[clientId];
        return next;
      });
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
                ? "bg-blue-600 text-white"
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
            className="h-11 w-full max-w-md rounded-md border border-gray-300 px-4 text-sm focus:border-blue-500 focus:outline-none"
          />
        </label>
        <p className="mt-2 text-xs text-gray-500">
          이름을 클릭하면 해당 행만 마스킹이 해제되며, 다시 클릭하면 마스킹됩니다.
        </p>
        {errorMessage ? <p className="mt-2 text-xs text-rose-600">{errorMessage}</p> : null}
      </div>

      <div className="overflow-x-auto">
        <div className="relative">
          <table className="min-w-full border-collapse text-sm">
          <thead className="bg-slate-100 text-left text-slate-900">
            <tr>
              <th className="px-4 py-3 font-semibold">이름</th>
              <th className="px-4 py-3 font-semibold">생년월일</th>
              <th className="px-4 py-3 font-semibold">스트레스 요인</th>
              <th className="px-4 py-3 font-semibold">사는곳(동)</th>
              <th className="px-4 py-3 font-semibold">
                {displayMode === "active" ? "등록일" : "삭제일"}
              </th>
              <th className="px-4 py-3 font-semibold">관리</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => {
              const isRevealed = Boolean(revealedNames[client.id]);
              return (
                <tr key={client.id} className="border-t border-gray-200">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleName(client.id)}
                      className="font-semibold text-gray-800 hover:text-blue-700"
                    >
                      {isRevealed ? client.name : maskName(client.name)}
                    </button>
                  </td>
                  <td className="px-4 py-3">{client.birthDate}</td>
                  <td className="px-4 py-3">{client.stressFactor}</td>
                  <td className="px-4 py-3">{client.location}</td>
                  <td className="px-4 py-3">
                    {formatKoreanDate(
                      displayMode === "active"
                        ? client.createdAt
                        : client.deletedAt ?? client.createdAt,
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {displayMode === "active" ? (
                        <>
                          <Link
                            href={`/admin/clients/curriculum?clientId=${client.id}&name=${encodeURIComponent(client.name)}`}
                            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            상세 보기
                          </Link>
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
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
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
        <div className="flex items-center gap-1">
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
    </div>
  );
}
