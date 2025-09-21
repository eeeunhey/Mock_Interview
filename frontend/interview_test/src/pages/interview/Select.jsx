// src/pages/interview/Select.jsx
import React from "react"; // ✅ React를 불러와 JSX(HTML처럼 보이는 문법)를 사용할 수 있게 함
import { useNavigate } from "react-router-dom"; // ✅ 페이지 이동(라우팅)을 위한 훅
import { Header } from "../../components/layout/baseLayout"; // ✅ 공통 상단 레이아웃에서 Header 컴포넌트를 가져옴 (named export 주의)

// ✅ 이 파일의 기본 컴포넌트(페이지) 정의 및 내보내기
export default function Select() {
  const nav = useNavigate(); // ✅ nav("경로") 형태로 다른 화면으로 이동할 수 있는 함수 생성

  // ✅ 컴포넌트가 화면에 그릴 JSX 반환
  return (
    // ✅ 최상위 컨테이너: 페이지 전체 배경/크기 설정
    // - min-h-screen: 최소 높이를 '뷰포트(화면) 높이'로
    // - w-full: 가로 100%
    // - bg-[#F7FAFC]: 아주 연한 파스텔 톤 배경색
    <div className="min-h-screen w-full bg-[#F7FAFC]">


      {/* ✅ 본문 래퍼: 가운데 정렬 + 최대 가로폭 + 여백 설정
          - max-w-[1200px]: 본문 가로폭을 1200px로 제한 → 너무 넓어져 가독성 떨어지는 것을 방지
          - mx-auto: 가로 중앙 정렬
          - px-4: 좌우 여백(16px)
          - py-8: 상하 여백(32px) */}
      <main className="max-w-[1200px] mx-auto px-4 py-8">
        {/* ✅ 카드를 2열로 배치하는 Grid
            - md:grid-cols-2: 화면이 md(보통 768px) 이상일 때 2열, 그 이하면 자동 1열
            - gap-8: 카드 사이 간격(보통 32px) */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* ===================== (왼쪽) 실전 면접 카드 ===================== */}
          {/* ✅ 카드 컨테이너
              - p-8: 내부 패딩 넉넉하게(32px)
              - rounded-2xl: 둥근 모서리
              - border: 테두리 표시
              - bg-white: 흰 배경
              - shadow-sm: 은은한 그림자
              - border-gray-200/60: ⬅️ 테두리를 '옅은 회색 60% 불투명도'로 → 기본보다 더 연하게 보임 */}
          <section className="p-8 rounded-2xl border bg-white shadow-sm border-gray-200/60">
            {/* ✅ 카드 제목: 크고 약간 두껍게, 아래 여백 */}
            <h2 className="text-xl font-semibold mb-6">실전 면접</h2>

            {/* ✅ 원형 배지(점수/상징)
                - w-24 h-24: 96px 정사각형 → 원형으로 만들면 지름 96px
                - rounded-full: 완전한 원 모양
                - bg-green-100: 연한 초록 배경
                - border: 테두리
                - border-green-200/70: ⬅️ 초록 테두리를 70% 불투명도로 '더 연하게'
                - shadow-inner: 안쪽으로 들어간 듯한 그림자(입체감)
                - flex items-center justify-center: 중앙 정렬
                - text-3xl font-bold text-green-600: 큰/굵은/초록 텍스트
                - mb-6: 하단 여백 */}
            <div
              className="w-24 h-24 rounded-full bg-green-100 border border-green-200/70 shadow-inner
                            flex items-center justify-center text-3xl font-bold text-green-600 mb-6"
            >
              {/* ✅ 배지 안의 텍스트(예: A+ 등급) */}
              A+
            </div>

            {/* ✅ 기능 요약 목록
                - space-y-1.5: 항목 간 세로 간격
                - text-sm: 작은 본문 텍스트
                - text-gray-700: 눈에 편한 짙은 회색
                - mb-8: 아래 버튼과의 간격 */}
            <ul className="space-y-1.5 text-sm text-gray-700 mb-8">
              <li>실제 면접과 유사한 환경에서의 면접 연습</li>
              <li>다양한 면접 유형에 대한 연습 기회 제공</li>
              <li>나의 이력서를 기반으로 한 면접 시뮬레이션</li>
              <li>단계에 기반한 점수화 점검</li>
              <li>AI 분석을 통한 맞춤형 피드백 제공</li>
              <li>종합 리포트 및 면접 결과 가능성 제공</li>
            </ul>

            {/* ✅ 시작 버튼
                - onClick: 클릭 시 nav("/interview/resume") → 이력서 화면으로 이동
                - px-4: 좌우 패딩, h-9: 높이 36px
                - rounded: 둥근 모서리
                - bg-green-600: 기본 초록 배경
                - hover:bg-green-700: 호버 시 조금 더 진한 초록
                - text-white text-sm: 흰색/작은 글자 */}
            <button
              onClick={() => nav("/interview/resume")}
              className="px-4 h-9 rounded bg-green-600 text-white text-sm hover:bg-green-700"
            >
              실전 면접 시작하기
            </button>
          </section>

          {/* ===================== (오른쪽) 모의 면접 카드 ===================== */}
          {/* ✅ 카드 컨테이너 (왼쪽 카드와 동일 UI, 테두리만 연하게)
              - border-gray-200/60: ⬅️ 테두리를 연하게 동일 적용 */}
          <section className="p-8 rounded-2xl border bg-white shadow-sm border-gray-200/60">
            {/* ✅ 카드 제목 */}
            <h2 className="text-xl font-semibold mb-6">모의 면접</h2>

            {/* ✅ 원형 배지(이모지)
                - 파란 톤 배경 + 연한 테두리로 '편안한 연습' 인상
                - border-blue-200/70: ⬅️ 파란 테두리를 70% 불투명도로 '더 연하게' */}
            <div
              className="w-24 h-24 rounded-full bg-blue-100 border border-blue-200/70 shadow-inner
                            flex items-center justify-center text-3xl mb-6"
            >
              {/* ✅ 친근한 느낌의 이모지 */}
              🙂
            </div>

            {/* ✅ 기능 요약 목록 (모의 면접에 맞춘 카피) */}
            <ul className="space-y-1.5 text-sm text-gray-700 mb-8">
              <li>다양한 면접 유형에 대한 연습 기회 제공</li>
              <li>나의 이력서를 기반으로 한 면접 시뮬레이션</li>
              <li>AI 분석을 통한 영상·음성 피드백 제공</li>
              <li>훈련 리포트 및 면접 결과 가능성 제공</li>
            </ul>

            {/* ✅ 시작 버튼 (모의 면접 → 이력서 화면 이동)
                - 파란 버튼 + 호버 시 투명도 변화로 가벼운 인터랙션 */}
            <button
              onClick={() => nav("/interview/resume")}
              className="px-4 h-9 rounded bg-[#3B82F6] text-white text-sm hover:opacity-90"
            >
              면접 연습 시작하기
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
