import React, { createContext, useContext,useEffect, useState } from  "react";
// useState (정보를 담고 있는 녀석)
// useEffect 화면에 이벤트가 발생할 때 실행
// createContext 여기저기 값을 나눠주기 위해 콘센트 만들기
// useContext 위에서 나눠주는 값 가져오기

const AuthContext = createContext(null);
// 로그인 정보 콘센트 만들기
// null을 넣었으니 로그인 전기를 아직 안넣음

export const AuthProvider = ({ children }) => {
  // AuthProvider 기능을 담아놓는 그릇 
  // App.jsx를 감싸서 로그인 기능을 전역으로 사용할 수 있게 할거다

  const [user, setUser ] = useState(null)

  // 새로고침해도 로그인 유지할 수 있게 localStroage(브라우저 저장소)를 사용해서 유지할 수 있게 하자
  useEffect (() => {
    const saved = localStorage.getItem("auth_user") // 문자열로 저장되어 있음
    if(saved) {
      try {
        setUser(JSON.parse(saved)); //문자열 -> 객체로 바꿔서 user에 넣는 코드
      } catch {
        // 혹시 저장된 문자열이 꺠졌을 떄 예의 처리 하는 부분
      }
    }
  }, []); // useEffect가 한번만 실행되는데 실행되믄 로그인상태로 복원해준다

  // 로그인 함수 : user 상태를 채우고 저장소에도 함께 기록
  const login = (userObj) => {
    setUser(userObj);
    localStorage.setItem("auth_user", JSON.stringify(userObj));
  };

  const logout = () => {
    setUser(null); // set에 저장된 user정보 지우기
    localStorage.removeItem("auth_user"); // 저장소에 있는 유저 정보 지우기
  }

  // Provider로 값 공급하기 : 여기 안에 있는 자식객체(childern )
  return (
      <AuthContext.Provider value={{ user, isAuth: !!user, login, logout}}>
        {children}
      </AuthContext.Provider>
  );
};

// 어디서든 값을 꺼내 쓰기 위해 작성
// 사용 예시: const { user, isAuth, login, logout } = useAuth();

export const useAuth = () => useContext(AuthContext);
