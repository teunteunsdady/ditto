export default function CompanyPage() {
  const manifestoSlides = [
    {
      label: "THE PROBLEM",
      title: "부유(浮遊)하는 세대",
      description:
        "우리는 그 어느 때보다 연결되어 있지만, 동시에 가장 쉽게 흔들리는 시대를 살고 있습니다. 타인의 SNS, 사회가 정한 성공의 기준, 끊임없이 쏟아지는 외부의 소음 속에서 2030의 자아는 마치 공중에 붕 뜬 것처럼 불안하게 흔들립니다.",
    },
    {
      label: "THE SOLUTION",
      title: "단단한 착지",
      description:
        "코어그라운드는 질문합니다. \"지금 당신은 당신의 두 발로 온전히 서 있나요?\" 우리는 단순히 위로를 건네는 것에 그치지 않습니다. 인문학적 통찰과 심리학적 체계를 바탕으로, 개인이 가진 고유한 핵심(Core)을 발견하고 그것을 삶의 단단한 지반(Ground)으로 만드는 정서적 근력을 기르고자 합니다.",
    },
    {
      label: "THE GOAL",
      title: "나라는 기준점",
      description:
        "세상의 시선이 아닌, 내면의 목소리에 집중할 때 비로소 우리는 흔들리지 않는 자유를 얻습니다. 코어그라운드는 모든 청년이 자신만의 중심지를 구축하여, 어떤 풍파 속에서도 자신을 잃지 않고 당당히 걸어 나갈 수 있는 세상을 꿈꿉니다.",
    },
  ];

  const keywords = [
    "정서적 근력",
    "내면의 기준점",
    "자기 이해에서 실행까지",
    "흔들리지 않는 중심",
    "청년 성장 설계",
    "코칭 기반 AI 키트",
  ];

  return (
    <main className="bg-white text-[#191f28]">
      <section className="mx-auto w-full max-w-6xl px-4 pb-12 pt-12 sm:px-6 sm:pb-14 sm:pt-16 lg:pb-16 lg:pt-20">
        <p className="text-xs font-semibold tracking-[0.16em] text-[#6b7684]">ABOUT</p>
        <h1 className="mt-5 text-3xl font-semibold leading-[1.18] tracking-tight sm:text-5xl lg:text-6xl">
          Founder&apos;s Manifesto
          <br />
          왜 지금 코어그라운드가 필요한가
        </h1>
        <p className="mt-8 max-w-3xl text-base leading-relaxed text-[#4e5968] sm:text-lg">
          문단 하나가 하나의 메시지로 남도록, 소개 페이지를 시트 구조로 구성했습니다.
        </p>
      </section>

      <section className="bg-[#fcfcfd]">
        <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-6 sm:px-6 sm:py-8">
          {manifestoSlides.map((item, index) => (
            <article
              key={item.title}
              className="min-h-[68svh] rounded-3xl border border-[#e8edf1] bg-white px-6 py-10 shadow-[0_10px_32px_rgba(15,23,42,0.05)] sm:px-10 sm:py-12"
            >
              <p className="text-xs font-semibold tracking-[0.16em] text-[#6b7684]">
                SHEET {index + 1} · {item.label}
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {item.title}
              </h2>
              <p className="mt-8 max-w-4xl text-base leading-relaxed text-[#333d4b] sm:text-lg sm:leading-8">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:py-20">
        <p className="text-xs font-semibold tracking-[0.16em] text-[#6b7684]">VISION</p>
        <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
          코칭에 AI를 접목해
          <br />
          실천형 성장 키트를 만듭니다
        </h2>
        <p className="mt-6 max-w-4xl text-base leading-relaxed text-[#4e5968] sm:text-lg">
          코어그라운드는 코칭 세션에서 끝나지 않는 변화를 위해 진단, 실행, 회고를 잇는 AI 기반
          코칭 키트를 개발합니다. 누구나 자신의 상태를 점검하고, 다음 행동을 선택하고, 변화를
          축적할 수 있는 도구를 일상에 안착시키는 것이 우리의 비전입니다.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {keywords.map((keyword) => (
            <span
              key={keyword}
              className="rounded-full border border-[#dbe3e0] bg-[#f5f8f7] px-3 py-1.5 text-xs font-semibold text-[#2f4f46] sm:text-sm"
            >
              {keyword}
            </span>
          ))}
        </div>
      </section>

      <section className="border-y border-[#eff1f4] bg-[#fcfcfd]">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:py-20">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#6b7684]">PROGRAMS</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "개인 프로그램",
                desc: "자기 이해와 실행 루틴 정착에 집중하는 1:1 코칭 트랙",
              },
              {
                title: "그룹 프로그램",
                desc: "소통 방식과 협업 기준을 정렬하는 팀/집단 코칭 트랙",
              },
              {
                title: "신입생 프로그램",
                desc: "새로운 환경 적응과 첫 100일 성장 설계를 돕는 온보딩 트랙",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-[#e5e8ee] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
              >
                <h3 className="text-xl font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#4e5968] sm:text-base">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:py-20">
        <p className="text-xs font-semibold tracking-[0.16em] text-[#6b7684]">CONTACT</p>
        <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          지금 코어를 점검하고
          <br />
          다음 행동을 시작해보세요
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#4e5968]">
          개인, 그룹, 신입생 프로그램 중 현재 상황에 맞는 흐름을 함께 설계해드립니다.
          문의를 남겨주시면 빠르게 상담 일정을 안내해드립니다.
        </p>
        <a
          href="/contact"
          className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-[#2f4f46] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#223c35]"
        >
          문의하기
        </a>
      </section>
    </main>
  );
}
