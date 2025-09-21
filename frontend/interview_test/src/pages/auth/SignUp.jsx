// src/pages/auth/SignUp.jsx
// ↑ 이 파일은 "회원가입(SignUp) 페이지" 화면과 로직을 담당합니다.

import React, { useState } from "react";            // React를 사용하고, 화면에서 바뀌는 값을 기억하기 위해 useState 훅을 가져옵니다.
import { useNavigate } from "react-router-dom";     // 페이지 이동을 도와주는 훅(예: 회원가입 후 홈으로 이동)을 가져옵니다.
import Input from "../../components/inputs/Input";  // 재사용 가능한 입력칸 컴포넌트를 가져옵니다(라벨/placeholder 포함된 예쁜 인풋).
import { validateEmail } from "../../utils/helper"; // 이메일이 올바른 모양인지 검사하는 도우미 함수를 가져옵니다.

// ✅ 공통 axios 인스턴스/경로 사용
import axiosInstance from "../../utils/axiosInstance"; // 서버와 통신할 때 쓰는 axios "전화기"인데, 기본 주소/헤더가 미리 설정되어 있습니다.
import { API_PATHS } from "../../utils/apiPaths";      // API 호출 경로를 모아둔 "주소록"입니다(회원가입/로그인 등 경로 텍스트).

// SignUp 이라는 React 컴포넌트를 선언합니다. 이게 실제 화면에 렌더링될 덩어리예요.
const SignUp = () => {
  // 아래는 입력폼에서 다룰 값들을 "상태(state)"로 선언합니다. 화면에서 바뀌는 값을 기억하는 메모장이라고 보면 됩니다.
  const [signId, setSignId] = useState("");        // 사용자가 적는 "아이디" 값을 저장합니다.
  const [username, setUsername] = useState("");    // 사용자가 적는 "이름" 값을 저장합니다.
  const [email, setEmail] = useState("");          // 사용자가 적는 "이메일" 값을 저장합니다.
  const [password, setPassword] = useState("");    // 사용자가 적는 "비밀번호" 값을 저장합니다.
  const [password2, setPassword2] = useState("");  // 사용자가 적는 "비밀번호 확인" 값을 저장합니다(같은지 비교하려고 필요).
  const [error, setError] = useState("");          // 화면에 보여줄 에러 메시지(문제 발생 시 빨간 글씨로 표시).

  const navigate = useNavigate();                  // 다른 페이지로 이동할 수 있게 해주는 함수(예: navigate("/login"))를 준비합니다.

  // 회원가입 폼을 제출했을 때 호출되는 함수입니다. 비동기(async)인 이유는 서버에 요청을 보내기 때문입니다.
  const handleSignUp = async (e) => {
    e.preventDefault(); // 폼의 기본 동작(페이지 새로고침)을 막습니다. 우리가 직접 처리하려고요.

    // --- [1] 빠른 입력값 검사(유효성 검사) ---
    // trim()은 앞뒤 공백을 제거합니다. 공백만 넣고 제출하는 실수를 막아줍니다.
    if (!signId.trim()) return setError("아이디를 입력해 주세요");                          // 아이디가 비었으면 에러 메시지를 보여주고 함수 종료.
    if (!username.trim()) return setError("이름을 입력해 주세요");                         // 이름이 비었으면 에러 메시지를 보여주고 종료.
    if (!validateEmail(email)) return setError("올바른 이메일 주소를 입력해 주세요");       // 이메일 형식이 틀리면 안내.
    if (!password || password.length < 8) return setError("비밀번호는 8자 이상 입력해 주세요"); // 비밀번호는 최소 8자.
    if (password !== password2) return setError("비밀번호가 일치하지 않습니다");           // 비밀번호 두 칸이 서로 다르면 에러.
    setError(""); // 여기까지 통과했다면 에러 메시지를 빈 문자열로 초기화합니다(에러 없음).

    // --- [2] 서버에 보낼 값들을 깔끔하게 정리 ---
    const idTrim = signId.trim();        // 아이디 앞뒤 공백 제거
    const pwTrim = password.trim();      // 비밀번호 앞뒤 공백 제거
    const nameTrim = username.trim();    // 이름 앞뒤 공백 제거
    const emailTrim = email.trim();      // 이메일 앞뒤 공백 제거

    try {
      // --- [3] 회원가입 요청 보내기 ---
      // axiosInstance.post(주소, 데이터) 형식으로 서버에 전송합니다.
      // API_PATHS.AUTH.REGISTER는 회원가입을 처리해주는 서버 경로 문자열입니다.
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        id: idTrim,     // 서버가 기대하는 키 이름이 id이므로, 여기에 깔끔한 아이디 값을 넣어줍니다.
        pw: pwTrim,     // 서버가 기대하는 키 이름이 pw이므로, 비밀번호 값을 넣어줍니다.
        name: nameTrim, // 이름을 넣습니다.
        email: emailTrim// 이메일을 넣습니다.
      });

      console.log("회원가입 성공:", response.data); // 개발 중에 확인하려고 서버의 응답을 콘솔에 찍습니다.

      // --- [4] (선택) 회원가입 후 바로 자동 로그인 시도 ---
      // 서버 로그인 스펙이 { id, pw }라면 그대로 전달합니다.
      await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        id: idTrim, // 방금 가입한 아이디로 로그인 요청
        pw: pwTrim, // 방금 가입한 비밀번호로 로그인 요청
      });

      alert("회원가입 및 자동 로그인이 완료되었습니다!"); // 사용자에게 성공 메시지 팝업을 보여줍니다.
      navigate("/"); // 홈(또는 대시보드) 페이지로 이동합니다.
    } catch (err) {
      // --- [5] 오류 처리(요청 실패, 중복, 서버오류 등) ---
      console.error(err); // 개발자가 문제를 파악하기 쉽게 콘솔에 전체 에러를 출력합니다.
      setError(
        // 서버에서 친절한 에러 메시지를 내려줬다면 그걸 쓰고, 없다면 기본 안내 문구를 씁니다.
        err?.response?.data?.message ||
        "회원가입에 실패했습니다. 아이디/이메일 중복 여부를 확인하고 다시 시도해 주세요."
      );
    }
  };

  // 아래는 실제 화면에 그려질 JSX입니다. HTML처럼 보이지만 JS 안에서 쓰는 "UI 선언"이에요.
  return (
    // 최상단 바깥 배경과 전체 세로 높이 설정(화면 전체 높이, 연한 회색 배경, 위아래 여백)
    <div className=" min-h-screen bg-gradient-to-br from-white via-blue-50 to-yellow-50 py-50" >
      {/* 가운데 정렬된 카드 형태의 박스를 만듭니다(최대 너비 제한, 하얀 배경, 테두리, 그림자, 안쪽 여백) */}
      <div className="mx-auto max-w-md rounded-2xl bg-white border border-gray-200 shadow-sm p-8">
        {/* 페이지 제목(글자 크기/굵기 설정) */}
        <h2 className="text-lg font-semibold">회원가입</h2>

        {/* 폼 시작: onSubmit에 handleSignUp을 연결해서 제출 시 우리가 만든 함수가 실행되도록 합니다.
            className으로 위쪽 여백(mt-6)과 항목 간 간격(space-y-5)을 지정합니다. */}
        <form onSubmit={handleSignUp} className="mt-6 space-y-5">
          {/* 아이디 입력칸: value로 상태를 연결하고(onChange로 타이핑 시 상태를 갱신), 라벨/힌트/타입을 지정합니다. */}
          <Input
            value={signId}                                  // 현재 아이디 상태 값
            onChange={({ target }) => setSignId(target.value)} // 입력이 바뀔 때 아이디 상태를 새 값으로 저장
            label="아이디"                                   // 위에 보일 라벨 텍스트
            placeholder="아이디를 입력하세요"                   // 흐리게 보이는 안내 문구
            type="text"                                      // 텍스트 입력 타입
          />

          {/* 이름 입력칸 */}
          <Input
            value={username}                                 // 현재 이름 상태 값
            onChange={({ target }) => setUsername(target.value)} // 입력이 바뀔 때 이름 상태 업데이트
            label="이름"                                     // 라벨
            placeholder="이름을 입력하세요"                     // 힌트
            type="text"                                      // 텍스트 입력
          />

          {/* 이메일 입력칸 */}
          <Input
            value={email}                                    // 현재 이메일 상태 값
            onChange={({ target }) => setEmail(target.value)}    // 입력이 바뀔 때 이메일 상태 업데이트
            label="이메일"                                   // 라벨
            placeholder="이메일을 입력하세요"                   // 힌트
            type="email"                                     // 이메일 입력(브라우저 기본 검증도 도움됨)
          />

          {/* 비밀번호 입력칸 */}
          <Input
            value={password}                                 // 현재 비밀번호 상태 값
            onChange={({ target }) => setPassword(target.value)} // 입력이 바뀔 때 비밀번호 상태 업데이트
            label="비밀번호"                                   // 라벨
            placeholder="최소 8자리 이상 입력하세요"              // 힌트
            type="password"                                  // 입력 내용이 가려지는 타입
          />

          {/* 비밀번호 확인 입력칸(같은지 비교하기 위한 두 번째 칸) */}
          <Input
            value={password2}                                // 현재 비밀번호 확인 상태 값
            onChange={({ target }) => setPassword2(target.value)} // 입력이 바뀔 때 비밀번호 확인 상태 업데이트
            label="비밀번호 확인"                              // 라벨
            placeholder="비밀번호를 다시 입력하세요"              // 힌트
            type="password"                                  // 가려지는 입력
          />

          {/* 에러 메시지 표시: error 문자열이 비어있지 않을 때만 빨간 글씨로 나타납니다. */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* 제출 버튼: type="submit"이므로 폼을 제출하고(handleSignUp 호출) 버튼은 가로 꽉 차게 스타일링합니다. */}
          <button
            type="submit"                                    // 제출용 버튼
            className="w-full px-5 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700" // 색/크기/모서리/호버 효과
          >
            회원가입
          </button>

          {/* 이미 계정이 있다면 로그인 페이지로 이동할 수 있는 안내문과 버튼입니다. */}
          <p className="text-sm text-gray-700 text-center">
            {/* 일반 텍스트와 버튼을 함께 배치합니다. */}
            이미 가입하셨나요?{" "}
            <button
              type="button"                                  // 폼 제출을 막기 위해 일반 버튼으로 지정
              onClick={() => navigate("/login")}             // 클릭 시 "/login" 경로로 페이지 이동
              className="font-medium text-blue-600 underline cursor-pointer hover:text-blue-500" // 파란색 밑줄/호버 스타일
            >
              로그인
            </button>
          </p>
        </form>
        {/* 폼 끝 */}
      </div>
      {/* 카드 컨테이너 끝 */}
    </div>
    // 최상단 배경 컨테이너 끝
  );
};

// 이 컴포넌트를 기본 내보내기(export default)하여, 다른 파일에서 import 해서 사용할 수 있게 합니다.
export default SignUp;
