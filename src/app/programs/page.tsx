export default function ProgramsPage() {
  const programs = [
    {
      title: "퍼스널 코어 프로그램",
      target: "개인 맞춤 코칭",
      duration: "6~8회 (회당 90분)",
      summary:
        "마인드(HTP), 커뮤니케이션(소셜아톰), 퍼스널리티(애니어)를 중심으로 자기 이해와 관계 역량을 강화합니다.",
      extras: ["문장완성", "마인드맵", "핵심감정"],
      outcomes: [
        "내가 흔들리는 패턴을 인식하고 조절하는 힘",
        "관계 상황에서 감정/표현의 기준 정립",
        "행동으로 이어지는 개인 실행 루틴 설계",
      ],
    },
    {
      title: "그룹 코어 프로그램",
      target: "팀/집단 코칭",
      duration: "4~6회 (회당 120분)",
      summary:
        "구성원의 정서·성향·소통 패턴을 입체적으로 파악하여 집단 내 협력과 신뢰를 설계합니다.",
      extras: ["문장완성", "마인드맵", "핵심감정"],
      outcomes: [
        "팀 내 관계 갈등의 원인 구조화",
        "상호 피드백과 공감 대화 역량 강화",
        "조직에 맞는 협업 원칙과 역할 합의",
      ],
    },
    {
      title: "새학기 온보딩 코칭",
      target: "1학년 · 신입사원 대상",
      duration: "3~5회 (회당 90분)",
      summary:
        "새로운 환경에서 겪는 불안과 관계 적응 이슈를 줄이고, 초기 성장 루틴을 세우는 온보딩 프로그램입니다.",
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
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-2xl font-bold text-[#1f3a33] sm:text-3xl">코어그라운드 프로그램</h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-[#52605b] sm:text-base">
        코어그라운드는 2030이 타인의 시선에 흔들리지 않고 자신의 중심을 세울 수 있도록
        진단과 코칭을 결합한 프로그램을 운영합니다.
      </p>

      <section className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-3">
        {programs.map((program) => (
          <article
            key={program.title}
            className="rounded-2xl border border-[#d8d3c5] bg-[#f6f2e8] p-5 shadow-sm sm:p-6"
          >
            <p className="inline-flex rounded-full bg-[#d7e2dc] px-3 py-1 text-xs font-semibold text-[#2f4f46]">
              {program.target}
            </p>
            <h2 className="mt-4 text-lg font-bold text-[#1f3a33] sm:text-xl">{program.title}</h2>
            <p className="mt-3 text-sm leading-7 text-[#51605a]">{program.summary}</p>
            <p className="mt-3 text-xs font-semibold text-[#2f4f46]">운영 기간: {program.duration}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {program.extras.map((extra) => (
                <span
                  key={extra}
                  className="rounded-full border border-[#bfc8be] bg-white px-3 py-1 text-xs font-medium text-[#3f4e48]"
                >
                  {extra}
                </span>
              ))}
            </div>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-[#4b5853]">
              {program.outcomes.map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-2xl border border-[#d8d3c5] bg-white p-5 sm:mt-10 sm:p-6">
        <h3 className="text-lg font-bold text-[#1f3a33]">운영 안내</h3>
        <p className="mt-3 text-sm leading-7 text-[#51605a]">
          사전 상담을 통해 대상, 목적, 운영 기간을 설계한 뒤 프로그램을 제안합니다. 개인/그룹
          운영 모두 가능하며, 결과 리포트와 후속 코칭 가이드를 함께 제공합니다.
        </p>
        <p className="mt-3 text-sm font-semibold text-[#2f4f46]">
          문의: 상담 문의 페이지에서 참여 목적과 대상 정보를 남겨주세요.
        </p>
      </section>

      <section className="mt-8 rounded-2xl border border-[#d8d3c5] bg-[#f6f2e8] p-5 sm:mt-10 sm:p-6">
        <h3 className="text-lg font-bold text-[#1f3a33]">진행 프로세스</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {process.map((item) => (
            <article key={item.step} className="rounded-xl border border-[#d3cebf] bg-white p-4">
              <p className="text-xs font-semibold text-[#2f4f46]">{item.step}</p>
              <h4 className="mt-1 text-base font-bold text-[#1f3a33]">{item.title}</h4>
              <p className="mt-2 text-sm leading-6 text-[#51605a]">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-[#d8d3c5] bg-white p-5 sm:mt-10 sm:p-6">
        <h3 className="text-lg font-bold text-[#1f3a33]">자주 묻는 질문</h3>
        <div className="mt-4 space-y-3">
          {faqs.map((faq) => (
            <article key={faq.q} className="rounded-lg border border-[#d8d3c5] bg-[#fbf9f3] p-4">
              <p className="text-sm font-semibold text-[#2f4f46]">Q. {faq.q}</p>
              <p className="mt-1 text-sm text-[#51605a]">A. {faq.a}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
