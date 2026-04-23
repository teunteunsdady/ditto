export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-2xl font-bold sm:text-3xl">개인정보처리방침</h1>
      <p className="mt-3 text-sm text-gray-500">시행일: 2026-04-23</p>

      <section className="mt-8 space-y-6 text-sm leading-7 text-gray-700">
        <div>
          <h2 className="text-base font-semibold text-gray-900">1. 총칙</h2>
          <p className="mt-2">
            CoreGround(이하 &quot;회사&quot;)는 이용자의 개인정보를 중요하게 생각하며, 「개인정보 보호법」,
            「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령을 준수합니다. 회사는 본
            개인정보처리방침을 통해 이용자의 개인정보가 어떠한 목적과 방식으로 이용되고, 어떠한 조치가
            취해지고 있는지 알려드립니다.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">2. 개인정보의 처리 목적</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>상담 문의 접수 및 회신</li>
            <li>서비스 안내, 고객 문의 응대, 민원 처리</li>
            <li>서비스 운영 및 보안 관리(비정상 이용 탐지, 기록 보관)</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">3. 처리하는 개인정보 항목</h2>
          <p className="mt-2">
            회사는 상담 문의 과정에서 아래 정보를 수집할 수 있습니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>필수: 이름, 연락처, 문의내용</li>
            <li>선택: 이메일, 문의유형</li>
            <li>자동 생성: 접속 로그, IP, 이용기록(보안/운영 목적)</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">4. 개인정보의 처리 및 보유 기간</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>상담 문의 정보: 수집일로부터 최대 3년 보관 후 파기</li>
            <li>
              관계 법령에 따라 보존이 필요한 경우에는 해당 법령에서 정한 기간 동안 별도 보관
            </li>
          </ul>
          <p className="mt-2">
            단, 이용자가 삭제를 요청하거나 처리 목적이 달성된 경우 지체 없이 파기합니다.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">5. 개인정보의 제3자 제공</h2>
          <p className="mt-2">
            회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 이용자의 별도 동의가
            있거나 법령에 근거한 경우에는 예외로 합니다.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">6. 개인정보 처리의 위탁</h2>
          <p className="mt-2">
            회사는 원활한 서비스 운영을 위해 아래와 같이 개인정보 처리 업무를 위탁할 수 있습니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>클라우드/DB 인프라 제공자: 데이터 저장 및 시스템 운영</li>
          </ul>
          <p className="mt-2">
            회사는 위탁계약 체결 시 관련 법령에 따라 개인정보가 안전하게 관리되도록 필요한 사항을
            규정하고 감독합니다.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">7. 정보주체의 권리와 행사 방법</h2>
          <p className="mt-2">
            이용자는 언제든지 회사에 대해 개인정보 열람, 정정, 삭제, 처리정지 요구 등 권리를 행사할 수
            있습니다. 권리 행사는 아래 연락처를 통해 요청할 수 있으며, 회사는 관련 법령에 따라 지체 없이
            조치합니다.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">8. 개인정보의 파기 절차 및 방법</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>파기 사유 발생 시 지체 없이 파기</li>
            <li>전자적 파일: 복구 불가능한 기술적 방법으로 삭제</li>
            <li>종이 문서: 분쇄 또는 소각</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">9. 개인정보의 안전성 확보조치</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>관리적 조치: 접근권한 최소화, 내부관리계획 수립</li>
            <li>기술적 조치: 접근 통제, 인증/보안 로그 관리, 취약점 대응</li>
            <li>물리적 조치: 서버/데이터 보관 시설 접근 통제</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">10. 쿠키 등 자동 수집 장치의 운영</h2>
          <p className="mt-2">
            회사는 서비스 품질 개선 및 보안 목적을 위해 쿠키 또는 유사 기술을 사용할 수 있습니다.
            이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 일부 기능 이용에 제한이 있을 수
            있습니다.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">11. 개인정보 보호책임자</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>성명/직책: [입력 필요]</li>
            <li>이메일: [입력 필요]</li>
            <li>연락처: [입력 필요]</li>
          </ul>
          <p className="mt-2">
            기타 개인정보 침해에 대한 신고나 상담이 필요하신 경우 아래 기관에 문의할 수 있습니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>개인정보침해신고센터 (privacy.kisa.or.kr / 국번없이 118)</li>
            <li>개인정보분쟁조정위원회 (www.kopico.go.kr / 1833-6972)</li>
            <li>대검찰청 사이버수사과 (www.spo.go.kr / 국번없이 1301)</li>
            <li>경찰청 사이버범죄 신고시스템 (ecrm.police.go.kr / 국번없이 182)</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">12. 방침 변경</h2>
          <p className="mt-2">
            본 개인정보처리방침은 관련 법령 및 회사 정책에 따라 변경될 수 있으며, 중요한 변경 사항은
            시행 전 서비스 화면을 통해 공지합니다.
          </p>
        </div>
      </section>
    </main>
  );
}
