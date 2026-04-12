"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type ClientRow = {
  id: string;
  name: string;
  birthDate: string;
  stressFactor: string;
  location: string;
};

const sampleClients: ClientRow[] = [
  { id: "1", name: "김하령", birthDate: "2007-04-19", stressFactor: "부모님", location: "성북구 동삭동" },
  { id: "2", name: "유세린", birthDate: "2001-09-05", stressFactor: "학업", location: "진관동" },
  { id: "3", name: "장재은", birthDate: "2003-09-22", stressFactor: "인간관계", location: "동선동" },
  { id: "4", name: "이고은", birthDate: "1997-03-21", stressFactor: "진로", location: "노원구 상계동" },
  { id: "5", name: "권영재", birthDate: "2007-09-03", stressFactor: "인간관계", location: "청량리" },
  { id: "6", name: "황준하", birthDate: "2001-05-07", stressFactor: "진로", location: "종로구 혜화동" },
  { id: "7", name: "정현래", birthDate: "2004-12-19", stressFactor: "수면부족", location: "성북구 정릉동" },
  { id: "8", name: "최가윤", birthDate: "2007-10-28", stressFactor: "학업", location: "번동" },
  { id: "9", name: "이시윤", birthDate: "2005-04-21", stressFactor: "환경 변화", location: "광운대" },
  { id: "10", name: "김소연", birthDate: "2006-04-03", stressFactor: "과제", location: "미아동" },
  { id: "11", name: "김태원", birthDate: "2002-10-31", stressFactor: "진로", location: "광진구 군자동" },
  { id: "12", name: "김지선", birthDate: "2007-10-29", stressFactor: "인간관계", location: "전농동" },
  { id: "13", name: "진영진", birthDate: "2026-04-09", stressFactor: "인간관계", location: "쌍문동" },
  { id: "14", name: "서은수", birthDate: "2026-04-15", stressFactor: "우울 테스트", location: "토오구 토오스" },
  { id: "15", name: "김유나", birthDate: "2026-04-12", stressFactor: "ㅇㅇ", location: "ㄹㄹ" },
];
const PAGE_SIZE = 6;

function maskName(name: string) {
  if (name.length <= 1) {
    return name;
  }
  if (name.length === 2) {
    return `${name[0]}*`;
  }
  return `${name[0]}${"*".repeat(name.length - 2)}${name[name.length - 1]}`;
}

export function ClientsListTable() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [revealedNames, setRevealedNames] = useState<Record<string, boolean>>({});

  const filteredClients = useMemo(() => {
    const keyword = search.trim();
    if (!keyword) {
      return sampleClients;
    }
    return sampleClients.filter((client) => client.name.includes(keyword));
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pagedClients = filteredClients.slice(startIndex, startIndex + PAGE_SIZE);

  const toggleName = (clientId: string) => {
    setRevealedNames((prev) => ({
      ...prev,
      [clientId]: !prev[clientId],
    }));
  };

  return (
    <div className="mt-6 rounded-xl border border-gray-300 bg-white">
      <div className="border-b border-gray-200 p-4 sm:p-6">
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
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-slate-100 text-left text-slate-900">
            <tr>
              <th className="px-4 py-3 font-semibold">이름</th>
              <th className="px-4 py-3 font-semibold">생년월일</th>
              <th className="px-4 py-3 font-semibold">스트레스 요인</th>
              <th className="px-4 py-3 font-semibold">사는곳(동)</th>
              <th className="px-4 py-3 font-semibold">관리</th>
            </tr>
          </thead>
          <tbody>
            {pagedClients.map((client) => {
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
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/clients/curriculum?clientId=${client.id}&name=${encodeURIComponent(client.name)}`}
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        상세 보기
                      </Link>
                      <button
                        type="button"
                        className="rounded-md bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {pagedClients.length === 0 ? (
              <tr className="border-t border-gray-200">
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4 py-4 sm:px-6">
        <p className="text-xs text-gray-500">
          총 {filteredClients.length}명 중 {Math.min(startIndex + 1, filteredClients.length)}-
          {Math.min(startIndex + PAGE_SIZE, filteredClients.length)}명 표시
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={safePage === 1}
            className="rounded border border-gray-300 px-2.5 py-1.5 text-xs disabled:opacity-40"
          >
            이전
          </button>
          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`rounded px-2.5 py-1.5 text-xs ${
                safePage === page
                  ? "bg-gray-900 text-white"
                  : "border border-gray-300 text-gray-700"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={safePage === totalPages}
            className="rounded border border-gray-300 px-2.5 py-1.5 text-xs disabled:opacity-40"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
