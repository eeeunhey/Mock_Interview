// src/components/layout/Header.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export function Header({ title = "내 앱" }) {
  const auth = useAuth();             // ✅ 여기서 null일 수도 있었던 문제가 있었음
  const navigate = useNavigate();

  const onGoHome = () => navigate("/");

  // (옵션) 방어적 렌더링: Provider 문제시 최소한의 UI
  if (!auth) return null;

  const { user, logout } = auth;

  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur border-b border-gray-200">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <button
          className="font-semibold tracking-tight text-gray-900 hover:opacity-80 transition cursor-pointer"
          onClick={onGoHome}
          aria-label="홈으로 이동"
          title={title}
        >
          {title}
        </button>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <span className="text-sm text-gray-600">안녕하세요, {user.name ?? "사용자"}님</span>
              <button
                className="px-3 py-2 rounded-xl text-sm bg-gray-900 text-white"
                onClick={logout}
              >
                로그아웃
              </button>
            </>
          ) : (
            <button
              className="px-3 py-2 rounded-xl text-sm border border-gray-300 hover:bg-gray-50"
              onClick={() => navigate("/login")}
            >
              로그인
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
