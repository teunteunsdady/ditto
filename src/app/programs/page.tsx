export default function ProgramsPage() {
  const programs = [
    {
      title: "퍼스널 코어 프로그램",
      target: "PERSONAL TRACK",
      duration: "6~8회 (회당 90분)",
      summary:
        "요즘 마음이 자주 흔들리거나 방향이 잘 안 잡힐 때, 현재 상태를 함께 정리하고 현실적인 변화 방법을 찾는 1:1 프로그램입니다.",
      extras: ["HTP", "소셜아톰", "애니어그램"],
      outcomes: [
        "자꾸 반복되는 감정 패턴을 알아차리고 조절하기",
        "관계에서 내 감정과 표현 기준 세우기",
        "생각에 머무르지 않고 실제 행동으로 옮기기",
      ],
    },
    {
      title: "그룹 코어 프로그램",
      target: "TEAM TRACK",
      duration: "4~6회 (회당 120분)",
      summary:
        "팀 분위기가 어색하거나 소통이 자꾸 꼬일 때, 서로의 차이를 이해하고 함께 일하는 방식을 맞춰가는 프로그램입니다.",
      extras: ["팀 진단", "관계 맵", "협업 원칙"],
      outcomes: [
        "팀 갈등의 원인을 정리하고 해결 실마리 찾기",
        "피드백과 대화가 덜 부담스럽게 바뀌기",
        "우리 팀에 맞는 협업 규칙과 역할 정하기",
      ],
    },
    {
      title: "새학기 온보딩 코칭",
      target: "ONBOARDING TRACK",
      duration: "3~5회 (회당 90분)",
      summary:
        "새로운 학교나 조직에 들어간 초기에 느끼는 불안과 막막함을 줄이고, 첫 100일을 안정적으로 시작하도록 돕는 프로그램입니다.",
      extras: ["적응 코칭", "관계 전략", "초기 목표 설계"],
      outcomes: [
        "초기 불안을 줄이고 적응 속도 높이기",
        "학교/조직에서 관계 맺는 기준 세우기",
        "첫 100일 목표와 점검 루틴 만들기",
      ],
    },
  ];

  const process = [
    {
      step: "STEP 1",
      title: "사전 상담",
      description:
        "지금 어떤 점이 가장 힘든지, 이번에 무엇이 달라지면 좋겠는지 먼저 가볍게 이야기합니다.",
    },
    {
      step: "STEP 2",
      title: "진단 및 해석",
      description:
        "진단 도구와 대화를 통해 현재 상태를 살펴보고, 지금 가장 먼저 바꿔야 할 핵심 포인트를 정합니다.",
    },
    {
      step: "STEP 3",
      title: "코칭 실행",
      description:
        "세션에서 정리한 내용을 일상에 바로 써볼 수 있게 작은 실천 과제와 함께 진행합니다.",
    },
    {
      step: "STEP 4",
      title: "리뷰 및 후속 제안",
      description:
        "실제로 달라진 점을 함께 확인하고, 변화가 끊기지 않도록 다음 단계까지 연결합니다.",
    },
  ];

  const faqs = [
    {
      q: "프로그램은 온라인/오프라인 모두 가능한가요?",
      a: "네. 대상과 목적에 따라 온라인, 오프라인, 혼합형으로 운영 가능합니다.",
    },
    {
      q: "개인 코칭과 그룹 코칭 중 어떤 것을 선택해야 하나요?",
      a: "혼자 정리하고 싶은 고민이 크면 개인 코칭, 팀 안에서의 소통과 협업 이슈가 크면 그룹 코칭을 권합니다. 상담에서 현재 상황에 맞게 함께 정해드립니다.",
    },
    {
      q: "결과 리포트가 제공되나요?",
      a: "네. 핵심 진단 요약과 바로 실행할 수 있는 포인트를 정리해 전달드립니다.",
    },
  ];

  return (
    <main className="bg-white text-[#191f28]">
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:pb-24 lg:pt-20">
        <p className="text-xs font-semibold tracking-[0.16em] text-[#6b7684]">PROGRAMS</p>
        <h1 className="mt-5 text-3xl font-semibold leading-[1.18] tracking-tight sm:text-5xl lg:text-6xl">
          CoreGround는 상황에 맞는 트랙을 함께 고르고
          <br />
          실제로 달라지는 변화까지 함께 갑니다
        </h1>
        <p className="mt-8 max-w-3xl text-base leading-relaxed text-[#4e5968] sm:text-lg">
          혼자 정리가 필요한지, 팀 소통을 맞춰야 하는지, 새 환경 적응이 필요한지에 따라
          지금 가장 필요한 프로그램을 제안합니다.
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
          상담 페이지에 현재 상황을 남겨주시면, 어떤 트랙이 맞는지 빠르게 안내해드립니다.
        </p>
      </section>
    </main>
  );
}
