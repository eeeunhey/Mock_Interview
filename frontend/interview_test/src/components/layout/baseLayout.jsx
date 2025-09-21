// src/components/baseLayout.js
import React from "react";


// ✅ Header 컴포넌트
export const Header = ({ title = "면접코치", onGoHome }) => (
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
      <nav className="flex gap-2 text-sm text-gray-700">
        <a className="px-3 py-2 rounded-xl hover:bg-gray-100" href="/login">로그인</a>
        <a className="px-3 py-2 rounded-xl hover:bg-gray-100" href="/signup">회원가입</a>
      </nav>
    </div>
  </header>
);

export const Footer = ({ containerClass = "max-w-[1100px]" }) => (
  <footer className="w-full border-t">
    <div className={`${containerClass} mx-auto px-4 py-8 text-xs text-gray-500 flex items-center justify-between`}>
      <span>© {new Date().getFullYear()} AI 면접 코치. All rights reserved.</span>
      <span>문의: support@example.com</span>
    </div>
  </footer>
);
