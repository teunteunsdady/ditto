export default function ProgramsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-24 sm:px-6">
      <h1 className="text-3xl font-bold">프로그램 안내</h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-700">
        이 페이지는 프로그램 전용 상세 페이지입니다. 추후 대표 프로그램 카드, 커리큘럼,
        기대 효과, 도입 프로세스를 배치해 확장할 수 있습니다.
      </p>
      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        {["리더십 코칭", "팀 코칭", "신임 리더 온보딩", "조직문화 워크숍"].map((title) => (
          <article key={title} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-gray-600">
              프로그램 소개 요약 텍스트를 배치하세요. 대상, 기간, 산출물을 간단히 보여주면 좋습니다.
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
