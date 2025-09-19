// src/pages/LandingPage.jsx
import React from "react";
// ✅ react-icons: 버튼 아이콘/카드 아이콘 등에 쓰는 라이브러리
import { LuArrowRight, LuListChecks, LuVideo, LuBrain } from "react-icons/lu";
// ✅ Header: 보통 named export일 때는 { Header }로 가져옵니다.
//    - 만약 Header가 default export라면: `import Header from ".../Header";` 로 바꾸세요.
import { Header } from "../components/layout/Header";
// ✅ 페이지 이동을 위한 라우터 훅 (ex: 버튼 클릭 시 다른 경로로)
import { useNavigate } from "react-router-dom";
// ✅ Footer: 여기서는 default export라고 가정
//    - 만약 { Footer } 형태라면 아래 줄을 `import { Footer } ...` 로 바꾸세요.
import {Footer} from "../components/layout/Footer";

// ✅ 기능 카드에 쓰일 정적 데이터(화면에서 반복 렌더링)
const FEATURES = [
  {
    id: 1,
    title: "나만의 질문 리스트로 연습",
    desc: "직무/자소서/직접 입력 질문을 묶어 실전처럼 연습합니다.",
    icon: <LuListChecks className="w-6 h-6" />, // 체크리스트 아이콘
  },
  {
    id: 2,
    title: "영상 분석 피드백",
    desc: "표정, 시선, 말 속도 등 비언어 지표를 분석해 개선점을 제시합니다.",
    icon: <LuVideo className="w-6 h-6" />, // 비디오 아이콘
  },
  {
    id: 3,
    title: "맞춤 질문 추천",
    desc: "직무/난이도/키워드 기반으로 꼭 필요한 질문만 추천합니다.",
    icon: <LuBrain className="w-6 h-6" />, // 뇌 아이콘
  },
];

// ✅ 페이지 컴포넌트(라우트에 연결되는 화면)
export default function LandingPage() {
  // 라우팅 이동 훅: onClick 등에서 navigate("/path")로 사용
  const navigate = useNavigate();

  return (
    // ✅ 화면 전체 컨테이너
    // - h-screen: 화면 높이만큼 채움
    // - flex flex-col: 세로로 헤더/본문/푸터 쌓기
    // - bg/text: 기본 배경/글자색
    <div className="h-screen bg-[#F7F8FA] text-gray-900 flex flex-col">
      {/* ✅ 상단 고정 헤더 (Header 내부에서 h-14(56px) 높이 가정) */}
      <Header />

      {/* ✅ 본문 래퍼
          - flex-1: 남은 공간을 모두 차지
          - overflow-y-auto: 세로 스크롤 가능
          - snap-y snap-mandatory: 섹션별 스크롤 스냅
          - pt-14: 헤더 높이만큼 위쪽 패딩(겹침 방지) */}
      <main className="flex-1 overflow-y-auto snap-y snap-mandatory pt-14">
        {/* ✅ [섹션 1] HERO: 첫 화면(제품 소개 + CTA 버튼)
            - min-h-screen: 한 화면 높이를 최소로
            - flex items-center: 수직 중앙 정렬 */}
        <section className="snap-start min-h-screen flex items-center">
          {/* ✅ 가운데 정렬 + 최대폭 컨테이너
              - md:grid-cols-2: 중간 화면 이상에서 2열
              - gap-10: 칼럼 사이 간격 */}
          <div className="mx-auto max-w-6xl px-4 grid md:grid-cols-2 gap-10 items-center">
            {/* ✅ 왼쪽: 제목/설명/버튼 */}
            <div>
              {/* 큰 타이틀(일부 단어 강조 색상) */}
              <h1 className="text-5xl md:text-5xl font-extrabold leading-tight">
                당신의 <span className="text-blue-600">AI 면접 코치</span>
              </h1>

              {/* 부제 문장: 톤 다운된 회색 */}
              <p className="mt-6 text-lg text-gray-600">
                질문 선택부터 영상 분석까지, 실전 환경과 가장 유사하게 연습하고
                즉시 피드백을 확인하세요.
              </p>

              {/* CTA 버튼: 클릭 시 면접 질문 선택 화면으로 이동 */}
              <div className="mt-10">
                <button
                  onClick={() => navigate("/interview/select")}
                  className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                >
                  지금 바로 시작하기 <LuArrowRight />
                </button>
              </div>
            </div>

            {/* ✅ 오른쪽: 미니멀한 시각 효과(그라데이션 글로우) */}
            <div className="relative">
              {/* 배경 발광 효과: absolute로 부모를 살짝 넘치게 깔아줌 */}
              <div className="absolute -inset-6 bg-gradient-to-tr from-blue-200/40 to-purple-200/40 blur-2xl rounded-[32px]" />
            </div>
          </div>
        </section>

        {/* ✅ [섹션 2] 기능 소개: 카드 3개 */}
        <section className="snap-start min-h-screen flex items-center bg-white">
          <div className="mx-auto max-w-6xl px-4 w-full">
            <h2 className="text-3xl md:text-4xl font-bold text-center">
              실전 대비 핵심 기능
            </h2>
            <p className="mt-3 text-center text-gray-600">
              질문 구성 → 면접 진행 → 분석 리포트까지 한 흐름으로 빠르게
            </p>

            {/* 카드 그리드: 모바일 1열 → 데스크탑 3열 */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              {FEATURES.map((f) => (
                <div
                  key={f.id} // 리스트 렌더링 시 필수 키
                  className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition"
                >
                  {/* 아이콘 + 제목 가로 정렬 */}
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gray-100 text-gray-700">
                      {f.icon}
                    </div>
                    <h3 className="font-semibold">{f.title}</h3>
                  </div>

                  {/* 설명 문장 */}
                  <p className="mt-3 text-sm text-gray-600">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ✅ [섹션 3] 사용자 가이드: 4단계 안내 */}
        <section className="snap-start min-h-screen flex items-center bg-gray-50">
          <div className="mx-auto max-w-6xl px-4 w-full">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8">
              사용자 가이드
            </h2>

            {/* 4단계(1~4) 안내 카드: md 이상에서 4열 */}
            <ol className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <li className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                <p className="text-xs font-medium text-blue-600">STEP 1</p>
                <h3 className="mt-2 font-semibold">자소서 업로드</h3>
                <p className="mt-2 text-sm text-gray-600">
                  PDF/텍스트로 자소서를 업로드하면 핵심 키워드를 추출합니다.
                </p>
              </li>

              <li className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                <p className="text-xs font-medium text-blue-600">STEP 2</p>
                <h3 className="mt-2 font-semibold">질문 자동 생성</h3>
                <p className="mt-2 text-sm text-gray-600">
                  생성된 질문 중 <span className="font-semibold">최대 3개</span>
                  를 선택하세요.
                </p>
              </li>

              <li className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                <p className="text-xs font-medium text-blue-600">STEP 3</p>
                <h3 className="mt-2 font-semibold">모의 면접 촬영</h3>
                <p className="mt-2 text-sm text-gray-600">
                  웹캠으로 답변 영상을 촬영합니다. 네트워크/마이크를 사전
                  점검하세요.
                </p>
              </li>

              <li className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                <p className="text-xs font-medium text-blue-600">STEP 4</p>
                <h3 className="mt-2 font-semibold">분석 리포트 확인</h3>
                <p className="mt-2 text-sm text-gray-600">
                  시선·표정·발화 속도 등 비언어 지표와 답변 요약 피드백을
                  제공합니다.
                </p>
              </li>
            </ol>
          </div>
        </section>

        {/* ✅ [섹션 4] 푸터: 한 화면 크게 보여주기 */}
        <section className="snap-start min-h-screen flex items-center justify-center border-t border-gray-100 bg-white">
          <Footer />
        </section>
      </main>
    </div>
  );
}
