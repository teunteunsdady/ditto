export function HomeScrollSections() {
  return (
    <>
      <section id="about" className="flex min-h-[84svh] items-center border-b border-[#e2e8f1] bg-white">
        <div
          data-reveal
          className="cg-container cg-section-y grid gap-10 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div data-reveal>
            <p className="cg-kicker">서비스 소개</p>
            <h2 className="cg-title-main mt-4">
              진단 기반 코칭으로
              <br />
              지속 가능한 행동 변화를 만듭니다
            </h2>
            <p className="cg-body mt-6 max-w-3xl">
              CoreGround는 심리 진단, 코칭 방법론, 실행 데이터 관리를 통합해 개인과 팀의 변화를
              구조적으로 설계합니다. 단발성 동기부여가 아닌, 실제 행동과 결과로 검증되는 변화 체계를
              제공합니다.
            </p>
            <p className="cg-body mt-4 max-w-3xl">
              우리는 정서적 통찰을 실행 가능한 루틴으로 변환하는 데 집중합니다. 이를 통해 참여자가
              의사결정 기준을 명확히 하고, 관계·학업·업무 현장에서 일관된 성과를 만들 수 있도록
              지원합니다.
            </p>
          </div>
          <aside className="space-y-4">
            <div data-reveal className="cg-panel-muted p-6 sm:p-8">
              <p className="cg-kicker">MISSION STATEMENT</p>
              <p className="mt-4 text-lg font-semibold leading-relaxed text-[#1f2925]">
                &quot;어렵고 막연한 변화가 아니라, 누구나 실행 가능한 변화를 만든다.&quot;
              </p>
              <ul className="mt-6 space-y-3 text-sm leading-relaxed text-[#4e5968] sm:text-base">
                <li>- 개인의 상태를 정확히 진단하고</li>
                <li>- 실행 가능한 행동 기준을 설계하며</li>
                <li>- 결과가 남는 변화까지 함께 완성합니다</li>
              </ul>
            </div>
            <div data-reveal className="cg-panel p-5 text-sm leading-relaxed text-[#4e5968]">
              CoreGround는 개인 코칭, 그룹 코칭, 신입생 온보딩까지 하나의 미션 아래 일관된 실행
              체계를 제공합니다.
            </div>
          </aside>
        </div>
      </section>

      <section id="expertise-1" className="flex min-h-[84svh] items-center border-b border-[#e2e8f1] bg-[#f7f9fc]">
        <div
          data-reveal
          className="cg-container cg-section-y grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start"
        >
          <div data-reveal>
            <p className="cg-kicker">차별화 포인트</p>
            <h2 className="cg-title-main mt-4">
              다면 진단 기반
              <br />
              개인 변화 전략 설계
            </h2>
            <p className="cg-body mt-6 max-w-2xl">
              HTP, 성격유형, 애착, 핵심감정 데이터를 단순 결과지로 끝내지 않고 의사결정 패턴·관계 패턴·
              실행 패턴으로 통합 해석합니다. 이후 목표-과제-피드백 루프를 연결해 개인 맞춤형 변화
              전략을 설계합니다.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: "진단 통합 해석", desc: "복수 검사 데이터를 단일 코칭 프레임으로 표준화" },
              { title: "정서 트리거 분석", desc: "반복되는 감정 촉발 지점과 반응 메커니즘 도출" },
              { title: "관계 맥락 코칭", desc: "상황별 소통 전략과 경계 설정 기준 정립" },
              { title: "실행 루틴 설계", desc: "주간 점검 기반의 행동 변화 루프 운영" },
            ].map((item) => (
              <article
                data-reveal
                key={item.title}
                className="cg-panel p-5"
              >
                <h3 className="text-base font-semibold text-[#1f2925]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4e5968]">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="expertise-2" className="flex min-h-[84svh] items-center border-b border-[#e2e8f1] bg-white">
        <div
          data-reveal
          className="cg-container cg-section-y grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start"
        >
          <div data-reveal className="cg-panel-muted p-6 sm:p-8">
            <p className="cg-kicker">COACHING SYSTEM</p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#3f4e49] sm:text-base">
              <li>진단 → 설계 → 실행 → 리뷰를 하나의 운영 모델로 통합</li>
              <li>개인/그룹/신입생 트랙별로 다른 실행 프레임 제공</li>
              <li>AI 보조 도구로 회고 정리, 다음 행동 제안 자동화</li>
              <li>코치와 참여자가 같은 지표를 보며 변화 추적</li>
            </ul>
          </div>
          <div data-reveal>
            <p className="cg-kicker">운영 체계</p>
            <h2 className="cg-title-main mt-4">
              코칭 운영과 AI를 결합한
              <br />
              실행 인프라 구축
            </h2>
            <p className="cg-body mt-6 max-w-2xl">
              CoreGround는 세션에서 얻은 통찰이 현장에서 사라지지 않도록 운영 아키텍처를 설계합니다.
              진단 결과, 실행 과제, 회고 기록, 다음 액션 제안이 하나의 흐름으로 연결되며 변화의
              지속성과 추적 가능성을 동시에 확보합니다.
            </p>
          </div>
        </div>
      </section>

      <section id="process" className="flex min-h-[84svh] items-center border-b border-[#e2e8f1] bg-[#f7f9fc]">
        <div className="cg-container cg-section-y">
          <div data-reveal>
            <p className="cg-kicker">우리가 일하는 방식</p>
            <h2 className="cg-title-main mt-4">
              진단에서 실행까지 이어지는
              <br />
              변화 운영 프로세스
            </h2>
            <p className="cg-body mt-5 max-w-3xl">
              CoreGround의 프로세스는 체크리스트가 아니라 운영 체계입니다. 현재 상태 진단, 변화 목표
              설정, 실행 코칭, 데이터 리뷰, 고도화까지 표준화된 단계로 설계해 재현 가능한 성과를
              만듭니다.
            </p>
          </div>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[
              { step: "01", title: "진단", desc: "먼저 지금의 상태를 감정, 관계, 행동 데이터로 정확히 읽어냅니다." },
              { step: "02", title: "프레임 설정", desc: "이후 변화 목표를 선명하게 정의하고, 확인 가능한 핵심 지표를 함께 정합니다." },
              { step: "03", title: "실행 코칭", desc: "세션에서 만든 통찰이 일상에서 실행되도록 주간 과제와 피드백 루프를 운영합니다." },
              { step: "04", title: "데이터 리뷰", desc: "행동률과 정서 변화, 관계 변화를 정기적으로 점검해 필요한 조정을 진행합니다." },
              { step: "05", title: "고도화", desc: "마지막으로 다음 단계 전략을 설계해 변화가 한 번으로 끝나지 않도록 확장합니다." },
            ].map((item) => (
              <li
                data-reveal
                key={item.step}
                className="cg-panel p-6"
              >
                <p className="cg-kicker">STEP {item.step}</p>
                <h3 className="mt-2 text-lg font-semibold text-[#1f2925]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4e5968]">{item.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="proof"
        className="relative flex min-h-[84svh] items-center overflow-hidden border-b border-[#d6deeb] bg-[#eef3fb] text-[#1b2430]"
      >
        <div
          data-reveal
          className="cg-container cg-section-y relative z-10"
        >
          <p className="cg-kicker">주요 사례 및 지표</p>
          <h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            변화를 열망하는 사람들이 모여,
            <br />
            결과로 남는 변화를 만듭니다.
          </h2>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:max-w-4xl">
            {[
              {
                label: "누적 운영 세션",
                value: "3,400+",
                note: "1:1 · 그룹 · 온보딩 통합 기준",
              },
              {
                label: "누적 참여 인원",
                value: "2,900+",
                note: "개인/팀 프로그램 참여자 합계",
              },
              {
                label: "평균 완주율",
                value: "91%",
                note: "최근 12개월 기준",
              },
              {
                label: "행동 과제 수행률",
                value: "84%",
                note: "세션 후 주간 실행 리포트 기준",
              },
            ].map((item) => (
              <article data-reveal key={item.label} className="cg-panel border-b-4 border-b-[#2d6bff] p-5">
                <p className="text-sm text-[#55657c]">{item.label}</p>
                <p className="cg-metric mt-2">{item.value}</p>
                <p className="mt-2 text-xs text-[#73839a]">{item.note}</p>
              </article>
            ))}
          </div>

          <div data-reveal className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#5e6f86]">
            <span>교육기관</span>
            <span>초기 커리어 조직</span>
            <span>성장 커뮤니티</span>
            <span>프로젝트 팀</span>
          </div>
        </div>

        <div className="proof-graph-wrap opacity-55">
          <svg
            viewBox="0 0 1200 360"
            aria-hidden="true"
            className="proof-graph-svg"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="proofAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(44,114,255,0.32)" />
                <stop offset="100%" stopColor="rgba(44,114,255,0)" />
              </linearGradient>
            </defs>
            <path
              d="M0,320 L120,300 L220,278 L300,245 L380,250 L470,210 L560,170 L640,128 L730,118 L810,102 L900,74 L980,58 L1060,44 L1140,28 L1200,10 L1200,360 L0,360 Z"
              fill="url(#proofAreaGradient)"
              className="proof-graph-area"
            />
            <path
              d="M0,320 L120,300 L220,278 L300,245 L380,250 L470,210 L560,170 L640,128 L730,118 L810,102 L900,74 L980,58 L1060,44 L1140,28 L1200,10"
              fill="none"
              stroke="#2d6bff"
              strokeWidth="4"
              strokeLinecap="round"
              className="proof-graph-line"
            />
            <path
              d="M0,320 L120,300 L220,278 L300,245 L380,250 L470,210 L560,170 L640,128 L730,118 L810,102 L900,74 L980,58 L1060,44 L1140,28 L1200,10"
              fill="none"
              stroke="rgba(87,145,255,0.45)"
              strokeWidth="12"
              strokeLinecap="round"
              className="proof-graph-glow"
            />
          </svg>
        </div>
      </section>

      <section className="border-b border-[#e2e8f1] bg-white">
        <div data-reveal className="cg-container cg-section-y">
          <p className="cg-kicker">주요 프로젝트 사례</p>
          <h2 className="cg-title-main mt-4">조직 맥락에 맞춘 실행형 코칭 레퍼런스</h2>
          <div className="mt-8 overflow-hidden rounded-2xl border border-[#dde3ee]">
            {[
              {
                org: "교육기관 A",
                program: "신입생 온보딩 코칭",
                outcome: "8주 완주율 93%, 중도 이탈률 32% 감소",
              },
              {
                org: "커뮤니티 B",
                program: "관계 패턴 진단 + 그룹 코칭",
                outcome: "참여자 자기이해 지표 4.6/5.0",
              },
              {
                org: "프로젝트 팀 C",
                program: "리더/실무자 협업 코칭",
                outcome: "회의 후 실행률 2.1배 향상",
              },
              {
                org: "성장 조직 D",
                program: "핵심감정 기반 1:1 코칭",
                outcome: "행동 과제 수행률 87% 유지",
              },
            ].map((item, index) => (
              <article
                key={item.org}
                className={`grid gap-2 px-5 py-4 sm:grid-cols-[0.9fr_1.2fr_1.4fr] sm:items-center sm:gap-4 ${
                  index !== 0 ? "cg-divider" : ""
                }`}
              >
                <p className="text-sm font-semibold text-[#1f2a37]">{item.org}</p>
                <p className="text-sm text-[#445265]">{item.program}</p>
                <p className="text-sm text-[#1f4f9a]">{item.outcome}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
