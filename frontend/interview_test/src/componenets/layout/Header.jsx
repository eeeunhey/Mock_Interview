// ==============================
// src/components/layout/Header.jsx
// 컨테이너 + (React.memo로 최적화된) 프레젠테이셔널 컴포넌트
// - 컨테이너(Header): 라우터/인증 훅 사용, 화면에 줄 데이터와 콜백만 뷰로 전달
// - 뷰(HeaderView): 훅/컨텍스트 전혀 사용 안 함 → React.memo로 불필요 렌더 방지
// ==============================

import React, { useCallback } from "react";                 // React와 useCallback 임포트
import { useLocation, useNavigate } from "react-router-dom"; // 라우터 훅(현재 경로/페이지 이동)
import { useAuth } from "../../context/AuthContext";         // 인증 컨텍스트(사용자/로그인 여부)

// ----------------------------------------------------------
// (1) 프레젠테이셔널 컴포넌트: HeaderView
// - "화면을 그리는 일"만 담당 (훅 X, 컨텍스트 X)
// - props가 같으면 다시 안 그리도록 React.memo로 감쌈
// ----------------------------------------------------------

// 링크 스타일을 만들어 주는 헬퍼(컴포넌트 바깥에 선언 → 매 렌더마다 새로 안 만들어짐)
const linkCls = (active) =>
  `px-3 py-2 rounded-xl text-sm transition ${
    active ? "bg-gray-900 text-white" : "hover:bg-gray-100 text-gray-700"
  }`;

// HeaderView는 화면만 그립니다.
function HeaderView({
  // ---- 화면에 필요한 데이터(props) ----
  title,          // 헤더 제목(예: "AI 면접 코치")
  isAuth,         // 로그인 여부 (true/false)
  userName,       // 사용자 이름 (로그인 상태일 때 표시)
  pathname,       // 현재 경로 (활성 탭 스타일에 필요)

  // ---- 이벤트 콜백(props) ----
  onGoHome,       // 로고 클릭 → 홈(또는 마이페이지) 이동
  onGoLogin,      // 로그인 버튼 클릭
  onGoSignup,     // 회원가입 버튼 클릭
  onGoMypage,     // 마이페이지 버튼/이름 클릭
}) {
  // 화면 마크업만 담당 (로직/훅 없음)
  return (
    // 상단 고정, 반투명 배경, 테두리
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur border-b border-gray-200">
      {/* 가운데 정렬 컨테이너: 좌측 로고 + 우측 네비게이션 */}
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        {/* 로고(제목). 클릭 시 onGoHome 실행 */}
        <button
          className="font-semibold tracking-tight text-gray-900 hover:opacity-80 transition cursor-pointer"
          onClick={onGoHome}                 // ← 컨테이너가 넘겨준 콜백 사용
          aria-label="홈으로 이동"
          title={title}                      // 툴팁에 제목 노출
        >
          {title}                            {/* 화면에 제목 텍스트 표시 */}
        </button>

        {/* 우측 네비게이션: 로그인 전/후 분기 */}
        {!isAuth ? (
          // --- 비로그인 상태 ---
          <nav className="flex items-center gap-2">
            {/* Home 버튼: 현재 경로가 "/"이면 active 스타일 */}
            <button
              onClick={onGoHome}              // 홈 이동 콜백
              className={linkCls(pathname === "/")}
            >
              Home
            </button>

            {/* 로그인 버튼: 현재 경로가 "/login"이면 active 스타일 */}
            <button
              onClick={onGoLogin}             // 로그인 페이지 이동 콜백
              className={linkCls(pathname === "/login")}
            >
              로그인
            </button>

            {/* 회원가입 버튼: 강조 스타일 */}
            <button
              onClick={onGoSignup}            // 회원가입 페이지 이동 콜백
              className="px-4 py-2 rounded-xl text-sm bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              회원가입
            </button>
          </nav>
        ) : (
          // --- 로그인 상태 ---
          <nav className="flex items-center gap-4">
            {/* 사용자 이름: 클릭 시 마이페이지로 이동 */}
            <button
              onClick={onGoMypage}            // 마이페이지 이동 콜백
              className="text-sm text-gray-700 font-medium hover:text-blue-600 transition"
            >
              {userName} 님
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}

// props가 바뀌지 않으면 다시 그리지 않도록 메모이징
const MemoHeaderView = React.memo(HeaderView);

// ----------------------------------------------------------
// (2) 컨테이너 컴포넌트: Header
// - 라우터/인증 훅을 사용해 "화면에 필요한 값과 콜백"을 만든 뒤
//   메모된 HeaderView에 props로 전달
// ----------------------------------------------------------
export default function Header() {
  const navigate = useNavigate();              // 페이지 이동 함수
  const { pathname } = useLocation();          // 현재 경로 문자열
  const { user, isAuth } = useAuth();          // 인증 정보: 사용자/로그인 여부

  // ----- 콜백들을 useCallback으로 메모이징 -----
  // 로고 클릭: 로그인 상태면 /mypage, 아니면 /
  const onGoHome = useCallback(() => {
    navigate(isAuth ? "/mypage" : "/");
  }, [navigate, isAuth]); // isAuth나 navigate가 바뀔 때만 새 함수 생성

  // 로그인 페이지로 이동
  const onGoLogin = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  // 회원가입 페이지로 이동
  const onGoSignup = useCallback(() => {
    navigate("/signup");
  }, [navigate]);

  // 마이페이지로 이동
  const onGoMypage = useCallback(() => {
    navigate("/mypage");
  }, [navigate]);

  // ----- 메모된 뷰에 필요한 데이터와 콜백만 전달 -----
  return (
    <MemoHeaderView
      title="AI 면접 코치"                 // 뷰가 표시할 제목
      isAuth={isAuth}                       // 로그인 여부
      userName={user?.name ?? "사용자"}     // 사용자명(없으면 기본값)
      pathname={pathname}                   // 현재 경로(활성 스타일용)
      onGoHome={onGoHome}                   // 콜백들
      onGoLogin={onGoLogin}
      onGoSignup={onGoSignup}
      onGoMypage={onGoMypage}
    />
  );
}
