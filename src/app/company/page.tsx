export default function CompanyPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-2xl font-bold text-[#1f3a33] sm:text-3xl">코어그라운드 소개</h1>
      <p className="mt-6 text-sm leading-7 text-[#51605a] sm:text-base">
        코어그라운드는 타인에게 흔들리지 않는 가장 깊은 중심을 찾도록 돕는 코칭 브랜드입니다.
        세상의 시선에 흔들리던 2030이 자신만의 기준을 세우고 지속 가능한 성장 루틴을 만들 수
        있도록 진단과 대화를 연결합니다.
      </p>
      <section className="mt-8 rounded-xl border border-[#d8d3c5] bg-[#f6f2e8] p-4 sm:p-5">
        <h2 className="text-lg font-bold text-[#2f4f46]">핵심 방향</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#4f5b57]">
          <li>마음의 중심과 정서적 안정 회복</li>
          <li>관계와 커뮤니케이션 역량 강화</li>
          <li>자기 이해를 바탕으로 한 실행력 확장</li>
        </ul>
      </section>
    </main>
  );
}
