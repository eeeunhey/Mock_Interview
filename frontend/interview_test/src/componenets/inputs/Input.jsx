// React 라이브러리에서 useState 훅을 가져온다 (상태 관리용)
import React, { useState } from "react";

// react-icons 라이브러리에서 "눈" 모양 아이콘 2개를 가져온다
// FaRegEye: 보이기 / FaRegEyeSlash: 가리기
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

// Input 이라는 재사용 가능한 컴포넌트 정의
// props로 value, onChange, label, placeholder, type을 받는다
// type은 기본값 "text"
const Input = ({ value, onChange, label, placeholder, type = "text" }) => {
  // showPassword: 비밀번호 보임 여부를 저장하는 상태 (true/false)
  // setShowPassword: 상태를 바꾸는 함수
  // 처음 값은 false → 즉, 기본은 비밀번호 가려짐
  const [showPassword, setShowPassword] = useState(false);

  // 보이기/가리기를 토글하는 함수
  // 현재 showPassword 값을 반대로 뒤집는다
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // 실제 화면에 그려지는 부분
  return (
    <div>
      {/* 인풋 위에 표시되는 라벨 텍스트 */}
      <label className="text-[13px] text-slate-800">{label}</label>

      {/* 인풋과 아이콘을 한 줄에 배치하는 박스 */}
      <div className="input-box">
        <input
          // 인풋의 type 결정
          // 만약 type이 "password"라면, showPassword에 따라 "text" 또는 "password"로 바뀜
          // 일반 text, email 같은 경우는 그대로 type 사용
          type={
            type === "password" ? (showPassword ? "text" : "password") : type
          }
          // placeholder: 빈칸일 때 흐릿하게 보이는 안내 문구
          placeholder={placeholder}
          // w-full: 가로 전체 채움, bg-transparent: 배경 투명, outline-none: 포커스 시 파란 외곽선 제거
          className="w-full bg-transparent outline-none"
          // value: 인풋에 들어 있는 글자 (부모에서 내려줌)
          value={value}
          // onChange: 인풋이 바뀔 때 부모 함수에 이벤트 전달
          onChange={(e) => onChange(e)}
        />

        {/* 만약 이 인풋이 비밀번호 칸(type="password")이면 눈 아이콘 표시 */}
        {type === "password" && (
          <>
            {/* showPassword가 true면 → "눈 아이콘" (비밀번호 보이는 상태) */}
            {showPassword ? (
              <FaRegEye
                size={22} // 아이콘 크기
                className="text-primary cursor-pointer" // 파란색 + 마우스 올리면 손가락 모양
                onClick={() => toggleShowPassword()} // 클릭 시 보이기/가리기 토글
              />
            ) : (
              // showPassword가 false면 → "눈 가림 아이콘" (비밀번호 가려진 상태)
              <FaRegEyeSlash
                size={22} // 아이콘 크기
                className="text-slate-400 cursor-pointer" // 회색 + 마우스 올리면 손가락 모양
                onClick={() => toggleShowPassword()} // 클릭 시 보이기/가리기 토글
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

// 다른 파일에서 import 할 수 있도록 내보내기
export default Input;
