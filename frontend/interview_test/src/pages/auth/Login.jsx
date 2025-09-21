// React에서 상태(state)와 컴포넌트 작성을 위해 useState를 불러온다.
import React, { useState } from "react";
// 페이지 간 이동(라우팅 전환)을 코드로 수행하기 위해 useNavigate 훅을 불러온다.
import { useNavigate } from "react-router-dom";

// 프로젝트에서 만든 커스텀 입력 컴포넌트. label/placeholder 등을 props로 받아 렌더링한다.
import Input from "../../components/inputs/Input";
// 전역 인증 상태(Context)를 사용하기 위한 훅. 로그인 시 전역 user를 갱신할 때 쓴다.
import { useAuth } from "../../context/AuthContext";
// 공통 설정이 적용된 axios 인스턴스(기본 baseURL, 인터셉터, 헤더 등)를 불러온다.
import axiosInstance from "../../utils/axiosInstance";
// API 경로 상수를 모아둔 객체. 하드코딩/오타를 줄이기 위함.
import { API_PATHS } from "../../utils/apiPaths";

/** 상단 네비게이션 (로고 좌측, 우측 액션 버튼들) */
function TopNav() {
  // 네비게이션을 위해 훅을 호출한다. 이 훅은 컴포넌트 내부에서만 호출 가능.
  const navigate = useNavigate();

  // 컴포넌트가 렌더링할 JSX 반환
  return (
    // sticky: 스크롤해도 상단에 고정 / z-30: 다른 요소보다 위에 / 반투명 흰 배경 + 블러 / 하단 테두리
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200">
      {/* 가운데 정렬 컨테이너: 최대 너비 제한 + 좌우 패딩 + 높이 56px(=h-14) + 좌우 공간 분배 */}
      <div className="mx-auto max-w-6xl h-14 px-4 flex items-center justify-between">
        {/* 좌측 로고 버튼: 클릭 시 홈('/')으로 이동 */}
        <button
          className="text-gray-900 font-semibold tracking-tight hover:opacity-80"
          onClick={() => navigate("/")}
          aria-label="AI 면접 코치 홈으로 이동"
        >
          AI 면접 코치
        </button>

        {/* 우측 네비게이션: 버튼들을 가로로 배치(gap-2: 간격 8px) + 작은 글자 크기 */}
        <nav className="flex items-center gap-2 text-sm">
          {/* '메인 페이지' 버튼: 클릭 시 '/mypage'로 이동. 스타일은 얇은 테두리 + 호버 시 옅은 배경 */}
          <button
            className="h-9 px-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
            onClick={() => navigate("/mypage")}
          >
            메인 페이지
          </button>
        </nav>
      </div>
    </header>
  );
}

// 로그인 페이지 메인 컴포넌트
const Login = () => {
  // 아이디 입력값 상태. 초기값은 빈 문자열.
  const [loginId, setLoginId] = useState("");
  // 비밀번호 입력값 상태.
  const [password, setPassword] = useState("");
  // 에러 메시지 상태. null이면 에러 없음.
  const [error, setError] = useState(null);
  // 중복 제출 방지 플래그. API 요청 진행 중일 때 true.
  const [submitting, setSubmitting] = useState(false);

  // 전역 인증 컨텍스트에서 login 함수를 가져온다. (user 상태 갱신용)
  const { login } = useAuth();
  // 라우팅 이동용 훅
  const navigate = useNavigate();

  // 로그인 폼 제출 핸들러
  const handleLogin = async (e) => {
    // 기본 폼 제출(페이지 새로고침)을 막는다.
    e.preventDefault();

    // 이미 제출 중이면(연타 방지) 함수 종료
    if (submitting) return;

    // 공백 제거한 값으로 검증을 수행한다.
    const idTrim = loginId.trim();
    const pwTrim = password.trim();

    // 아이디가 비어 있으면 에러 메시지 설정 후 종료
    if (!idTrim) return setError("아이디를 입력해 주세요");
    // 비밀번호가 비어 있으면 에러 메시지 설정 후 종료
    if (!pwTrim) return setError("비밀번호를 입력해 주세요");

    // 기존 에러 초기화
    setError(null);
    // 제출 중 상태로 전환(버튼 비활성화/스피너 텍스트 등 표시)
    setSubmitting(true);

    try {
      // 서버에 로그인 요청. 보통 API_PATHS.AUTH.LOGIN은 '/auth/login' 같은 문자열.
      const res = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        id: idTrim,         // 백엔드가 요구하는 필드명에 맞춰 전송
        password: pwTrim,   // 비밀번호
      });

      // 서버가 돌려준 응답에서 user와 token을 구조분해 할당. (안전하게 기본값 {})
      // 예시 응답: { token: "JWT...", user: { id: 1, name: "홍길동", ... } }
      const { user, token } = res.data || {};

      // 토큰이 없거나 빈 문자열이라면 실패로 간주하여 메시지 표시
      if (!token || token.trim() === "") {
        setError("로그인에 실패했습니다. 다시 시도해 주세요");
        return; // 이후 로직 실행하지 않음
      }

      // 정상 토큰이면 브라우저 저장소(localStorage)에 저장 (새로고침해도 유지됨)
      localStorage.setItem("token", token);

      // 전역 인증 상태(user)를 갱신한다.
      // 서버가 user 객체를 주면 필요한 필드만 저장하고, 없으면 loginId만 저장.
      if (user) {
        login({ id: user.id, name: user.name, loginId: idTrim });
      } else {
        login({ loginId: idTrim });
      }

      // 로그인 성공 후 랜딩 페이지로 이동
      navigate("/landing");
    } catch (err) {
      // 네트워크/서버 에러를 콘솔에 출력(개발용)
      console.error(err);

      // 서버가 표준 메시지를 보냈다면 우선 사용한다.
      // 1) { message: "..." } 형식
      // 2) { error: "..." } 형식
      // 3) HTTP 401이면 인증 실패로 간주해 기본 메시지 사용
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (err?.response?.status === 401
          ? "아이디 또는 비밀번호가 올바르지 않습니다"
          : null);

      // 사용자에게 보여줄 최종 에러 메시지 설정
      setError(serverMsg || "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      // 성공/실패와 무관하게 제출 중 상태를 해제(버튼 다시 활성화)
      setSubmitting(false);
    }
  };

  // 실제 화면에 렌더링할 JSX 반환
  return (
     <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-yellow-50">
    <TopNav />

    <main className="mx-auto max-w-6xl px-4">
      <div className="flex justify-center">
        {/* 카드 폭 살짝 넓힘 */}
        <div className="w-full max-w-lg">
          {/* ⬇️ 둥근 모서리 크게 + 넉넉한 패딩 + 약한 그림자 */}
          <div className="mt-16 bg-white rounded-[20px] shadow-xl ring-1 ring-black/1 p-10 md:p-14">
            {/* 제목 굵고 큼 */}
            <h1 className="text-center text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
              로그인
            </h1>
            {/* 설명문 살짝 크고 연한 색 */}
            <p className="mt-3 text-center text-base md:text-lg text-gray-500">
              면접 준비, 지금 바로 시작하세요!
            </p>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              {/* 입력칸 — 컴포넌트 기본 스타일을 쓰되 간격만 조정 */}
              <Input
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                label="아이디"
                placeholder="아이디"
                type="text"
                autoComplete="username"
              />
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label="비밀번호"
                placeholder="비밀번호"
                type="password"
                autoComplete="current-password"
              />

              {error && (
                <p className="text-red-500 text-xs -mt-1">{error}</p>
              )}

              {/* 파란 기본 버튼 — 높이/폰트 키움 */}
              <button
                type="submit"
                disabled={submitting}
                className={`w-full h-12 rounded-xl text-white text-base font-semibold transition
                ${submitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {submitting ? "로그인 중..." : "로그인"}
              </button>

              {/* 회색 외곽선 → 파란 테두리 아웃라인 버튼 */}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="w-full h-12 rounded-xl border-2 border-blue-600 text-blue-600 text-base font-semibold hover:bg-blue-50 transition"
              >
                회원가입
              </button>

              {/* 하단 얇은 링크 */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => navigate("/find-account")}
                  className="text-sm text-blue-600 underline underline-offset-4 decoration-1 hover:text-blue-700"
                >
                  아이디 · 비밀번호 찾기
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="h-16" />
    </main>
  </div>
  );
};

// 다른 파일에서 이 컴포넌트를 import하여 사용할 수 있도록 기본(default) 내보내기
export default Login;
