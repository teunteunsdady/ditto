export default function ProgramsPage() {
  const programs = [
    {
      title: "퍼스널 코어 프로그램",
      target: "PERSONAL TRACK",
      duration: "6~8회 (회당 90분)",
      summary:
        "마인드(HTP), 커뮤니케이션(소셜아톰), 애니어그램을 기반으로 개인의 중심과 실행 기준을 설계합니다.",
      extras: ["HTP", "소셜아톰", "애니어그램"],
      outcomes: [
        "흔들리는 패턴을 인식하고 조절하는 힘",
        "관계 상황에서 감정/표현 기준 정립",
        "행동으로 이어지는 실행 루틴 설계",
      ],
    },
    {
      title: "그룹 코어 프로그램",
      target: "TEAM TRACK",
      duration: "4~6회 (회당 120분)",
      summary:
        "구성원의 정서·성향·소통 패턴을 입체적으로 파악해 팀의 협업 방식과 신뢰 구조를 재설계합니다.",
      extras: ["팀 진단", "관계 맵", "협업 원칙"],
      outcomes: [
        "팀 내 관계 갈등의 원인 구조화 및 해소",
        "상호 피드백과 공감 대화 역량 강화",
        "조직에 맞는 협업 원칙과 역할 합의",
      ],
    },
    {
      title: "새학기 온보딩 코칭",
      target: "ONBOARDING TRACK",
      duration: "3~5회 (회당 90분)",
      summary:
        "새로운 환경에서의 불안과 관계 적응 이슈를 줄이고, 초기 100일 성장 루틴을 세우는 프로그램입니다.",
      extras: ["적응 코칭", "관계 전략", "초기 목표 설계"],
      outcomes: [
        "초기 불안 감소와 환경 적응 속도 향상",
        "학교/조직 내 관계 설정 기준 수립",
        "첫 100일 실행 목표와 점검 체계 마련",
      ],
    },
  ];

  const process = [
    {
      step: "STEP 1",
      title: "사전 상담",
      description:
        "참여 대상, 현재 이슈, 기대 변화를 확인하고 가장 적합한 운영 형태를 제안합니다.",
    },
    {
      step: "STEP 2",
      title: "진단 및 해석",
      description:
        "HTP · 소셜아톰 · 애니어그램을 포함한 진단 도구로 현재 상태를 파악하고 핵심 과제를 정의합니다.",
    },
    {
      step: "STEP 3",
      title: "코칭 실행",
      description:
        "개인/그룹 목표에 맞춰 세션을 진행하며, 실생활에 적용 가능한 행동 변화 과제를 병행합니다.",
    },
    {
      step: "STEP 4",
      title: "리뷰 및 후속 제안",
      description:
        "변화 지점을 리뷰하고 유지 전략을 정리해 이후 성장 단계로 자연스럽게 연결합니다.",
    },
  ];

  const faqs = [
    {
      q: "프로그램은 온라인/오프라인 모두 가능한가요?",
      a: "네. 대상과 목적에 따라 온라인, 오프라인, 혼합형으로 운영 가능합니다.",
    },
    {
      q: "개인 코칭과 그룹 코칭 중 어떤 것을 선택해야 하나요?",
      a: "현재 이슈가 개인 내면 중심인지, 팀 관계/협업 중심인지에 따라 적합한 형태를 상담으로 안내드립니다.",
    },
    {
      q: "결과 리포트가 제공되나요?",
      a: "진단 해석 요약과 핵심 실행 포인트를 정리한 결과 가이드를 제공합니다.",
    },
  ];

  return (
    <main className="bg-white text-[#191f28]">
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:pb-24 lg:pt-20">
        <p className="text-xs font-semibold tracking-[0.16em] text-[#6b7684]">PROGRAMS</p>
        <h1 className="mt-5 text-3xl font-semibold leading-[1.18] tracking-tight sm:text-5xl lg:text-6xl">
          CoreGround는 목적에 맞는 트랙을 제안하고
          <br />
          실행 가능한 변화까지 함께 설계합니다
        </h1>
        <p className="mt-8 max-w-3xl text-base leading-relaxed text-[#4e5968] sm:text-lg">
          개인의 내면 정렬이 필요한지, 팀의 협업 구조 개선이 필요한지, 혹은 새로운 환경 적응이
          필요한지에 따라 가장 적합한 프로그램을 구성합니다.
        </p>
      </section>

      <section className="border-y border-[#eff1f4] bg-[#fcfcfd]">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:py-20">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#6b7684]">PROGRAM TRACKS</p>
          <div className="mt-8">
            {programs.map((program) => (
              <article key={program.title} className="border-b border-[#eceff3] py-9 first:pt-0 last:border-b-0 last:pb-0">
                <p className="text-xs font-semibold tracking-[0.12em] text-[#8b95a1]">{program.target}</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">{program.title}</h2>
                <p className="mt-1 text-sm font-medium text-[#6b7684]">{program.duration}</p>
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#4e5968] sm:text-base">
                  {program.summary}
                </p>
                <p className="mt-4 text-xs font-semibold tracking-[0.1em] text-[#8b95a1]">TOOLS</p>
                <p className="mt-1 text-sm text-[#4e5968]">{program.extras.join(" · ")}</p>
                <ul className="mt-4 space-y-1 text-sm text-[#4e5968]">
                  {program.outcomes.map((outcome) => (
                    <li key={outcome}>- {outcome}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:py-20">
        <p className="text-xs font-semibold tracking-[0.16em] text-[#6b7684]">PROCESS</p>
        <ol className="mt-8 space-y-7">
          {process.map((item) => (
            <li key={item.step} className="border-b border-[#eceff3] pb-7 last:border-b-0 last:pb-0">
              <p className="text-xs font-semibold tracking-[0.12em] text-[#8b95a1]">{item.step}</p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">{item.title}</h3>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#4e5968] sm:text-base">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20 lg:pb-24">
        <p className="text-xs font-semibold tracking-[0.16em] text-[#6b7684]">FAQ</p>
        <div className="mt-8">
          {faqs.map((faq) => (
            <article key={faq.q} className="border-b border-[#eceff3] py-6 first:pt-0 last:border-b-0 last:pb-0">
              <p className="text-lg font-semibold tracking-tight text-[#191f28]">{faq.q}</p>
              <p className="mt-2 text-sm leading-relaxed text-[#4e5968] sm:text-base">{faq.a}</p>
            </article>
          ))}
        </div>
        <p className="mt-10 text-sm text-[#4e5968]">
          프로그램 문의는 상담 페이지에서 참여 대상과 목적을 남겨주시면 빠르게 안내드립니다.
        </p>
      </section>
    </main>
  );
}
