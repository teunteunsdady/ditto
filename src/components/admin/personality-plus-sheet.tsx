"use client";

const TABLE_HEADERS = ["매우 그렇다", "그렇다", "보통이다", "아니다", "전혀 아니다"] as const;
const ROW_COUNT = 81;

export function PersonalityPlusSheet() {
  return (
    <div className="mt-8 overflow-x-auto rounded-xl border border-slate-300 bg-white">
      <table className="min-w-[760px] w-full border-collapse text-xs sm:min-w-[900px] sm:text-sm">
        <thead className="bg-slate-100 text-slate-900">
          <tr>
            <th className="border border-slate-300 px-3 py-2 text-center font-semibold">번호</th>
            <th className="border border-slate-300 px-3 py-2 text-left font-semibold">문항</th>
            {TABLE_HEADERS.map((header) => (
              <th key={header} className="border border-slate-300 px-3 py-2 text-center font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: ROW_COUNT }, (_, index) => {
            const no = index + 1;
            return (
              <tr key={no} className="odd:bg-white even:bg-slate-50">
                <td className="border border-slate-200 px-3 py-2 text-center">{no}</td>
                <td className="border border-slate-200 px-3 py-2 text-slate-400">문항 준비 중</td>
                {TABLE_HEADERS.map((header) => (
                  <td key={`${no}-${header}`} className="border border-slate-200 px-3 py-2 text-center text-slate-400">
                    ○
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
