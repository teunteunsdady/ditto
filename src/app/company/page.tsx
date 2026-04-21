import Image from "next/image";
import Link from "next/link";

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
        "CoreGround는 질문합니다. \"지금 당신은 당신의 두 발로 온전히 서 있나요?\" 우리는 단순히 위로를 건네는 것에 그치지 않습니다. 인문학적 통찰과 심리학적 체계를 바탕으로, 개인이 가진 고유한 핵심(Core)을 발견하고 그것을 삶의 단단한 지반(Ground)으로 만드는 정서적 근력을 기르고자 합니다.",
    },
    {
      label: "THE GOAL",
      title: "나라는 기준점",
      description:
        "세상의 시선이 아닌, 내면의 목소리에 집중할 때 비로소 우리는 흔들리지 않는 자유를 얻습니다. CoreGround는 모든 청년이 자신만의 중심지를 구축하여, 어떤 풍파 속에서도 자신을 잃지 않고 당당히 걸어 나갈 수 있는 세상을 꿈꿉니다.",
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

  const programs = [
    {
      title: "개인 프로그램",
      detail: "자기 이해와 실행 루틴 정착에 집중하는 1:1 코칭 트랙",
    },
    {
      title: "그룹 프로그램",
      detail: "소통 방식과 협업 기준을 정렬하는 팀/집단 코칭 트랙",
    },
    {
      title: "신입생 프로그램",
      detail: "새로운 환경 적응과 첫 100일 성장을 설계하는 온보딩 트랙",
    },
  ];

  return (
    <main className="bg-[#f5f6f4] text-[#191f28]">
      <section className="relative overflow-hidden border-b border-[#e7ebe8] bg-white">
        <div className="pointer-events-none absolute right-[-4.5rem] top-[-3rem] h-72 w-72 opacity-[0.06] sm:right-[-3rem] sm:h-96 sm:w-96">
          <Image src="/images/coreground-logo.png" alt="" fill sizes="384px" className="object-contain" />
        </div>
        <div className="mx-auto w-full max-w-6xl px-4 pb-14 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:pb-20 lg:pt-20">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#6b7684]">FOUNDER&apos;S MANIFESTO</p>
          <h1 className="mt-5 text-3xl font-semibold leading-[1.18] tracking-tight sm:text-5xl lg:text-6xl">
            왜 지금 &apos;CoreGround&apos;가 필요한가
          </h1>
          <p className="mt-7 max-w-3xl text-base leading-relaxed text-[#4e5968] sm:text-lg">
            우리는 연결되어 있지만 쉽게 흔들리는 시대를 살고 있습니다. CoreGround는 위로를 넘어,
            개인의 핵심을 삶의 지반으로 만드는 정서적 근력을 설계합니다.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl space-y-4 px-4 py-6 sm:px-6 sm:py-8">
        <p className="pt-2 text-xs font-semibold tracking-[0.16em] text-[#6b7684]">문단 = 한 시트</p>
        <div className="space-y-4">
          {manifestoSlides.map((item, index) => (
            <article
              key={item.title}
              className="relative min-h-[64svh] overflow-hidden rounded-[28px] border border-[#dfe6e3] bg-white px-6 py-10 shadow-[0_14px_36px_rgba(15,23,42,0.06)] sm:px-10 sm:py-12"
            >
              <div className="pointer-events-none absolute right-4 top-4 h-20 w-20 opacity-[0.045] sm:h-28 sm:w-28">
                <Image src="/images/coreground-logo.png" alt="" fill sizes="112px" className="object-contain" />
              </div>
              <p className="text-xs font-semibold tracking-[0.16em] text-[#6b7684]">
                SHEET {index + 1} · {item.label}
              </p>
              <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {item.title}
              </h2>
              <p className="mt-8 max-w-4xl text-base leading-relaxed text-[#333d4b] sm:text-lg sm:leading-8">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[#e7ebe8] bg-[#f8faf9]">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-[#6b7684]">VISION</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              코칭과 AI를 접목한
              <br />
              실천형 성장 키트 개발
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-[#4e5968] sm:text-lg">
              진단-실행-회고를 한 흐름으로 연결해, 누구나 자신의 상태를 점검하고 다음 행동을
              선택하도록 돕는 코칭 AI 키트를 만듭니다.
            </p>
          </div>
          <div className="rounded-3xl border border-[#dde5e2] bg-white p-6 sm:p-7">
            <p className="text-xs font-semibold tracking-[0.16em] text-[#6b7684]">KEY KEYWORDS</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full border border-[#dbe3e0] bg-[#f5f8f7] px-3 py-1.5 text-xs font-semibold text-[#2f4f46] sm:text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:py-20">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-[#6b7684]">PROGRAMS</p>
          <h3 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">개인 · 그룹 · 신입생</h3>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {programs.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-[#e2e7e5] bg-white p-6"
              >
                <h4 className="text-xl font-semibold tracking-tight">{item.title}</h4>
                <p className="mt-3 text-sm leading-relaxed text-[#4e5968] sm:text-base">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#e7ebe8] bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:py-20">
          <div className="rounded-3xl bg-[#2f4f46] px-6 py-10 text-white sm:px-10 sm:py-12">
            <p className="text-xs font-semibold tracking-[0.16em] text-[#d7e8e1]">CONTACT</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              지금 나의 중심점을 점검해보세요
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#e6f1ec] sm:text-base">
              현재 고민과 목표를 남겨주시면 개인, 그룹, 신입생 중 가장 적합한 코칭 흐름으로 빠르게
              안내해드립니다.
            </p>
            <Link
              href="/contact"
              className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-[#223c35] transition-colors hover:bg-[#edf4f1]"
            >
              문의하기
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
