// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";

// 공용 Header/Footer
import { Header, Footer } from "./components/layout/baseLayout";
// 페이지들
import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import Select from "./pages/interview/Select";
import ResumeUploadPage from "./pages/interview/ResumeUpload";
import QuestionListPage from "./pages/interview/QuestionList";
import Calibration from "./pages/interview/Calibration";

/** 내부 컴포넌트: 현재 경로에 따라 Header/Footer 표시 여부 제어 + 스크롤 컨테이너 제공 */
function AppInner() {
  const location = useLocation();
  const navigate = useNavigate();

  // ▸ 헤더/푸터를 숨길 경로 (필요에 맞게 조정)
  const HIDE_HEADER_ON = ["/login", "/signup"];
  const HIDE_FOOTER_ON = ["/login", "/signup"];

  const showHeader = !HIDE_HEADER_ON.includes(location.pathname);
  const showFooter = !HIDE_FOOTER_ON.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA]">
      {/* 상단 공용 Header */}
      {showHeader && <Header title="면접코치" onGoHome={() => navigate("/")} />}

      {/* 본문 스크롤/스냅 컨테이너 (여기에 Routes 넣음) */}
      <div
        className={[
          "flex-1 overflow-y-auto snap-y snap-mandatory scroll-smooth",
          showHeader ? "pt-14" : "", // sticky 헤더 높이만큼 겹침 방지 (Header가 h-14=56px일 때)
          // 푸터는 고정이 아니므로 별도 pb는 불필요. (푸터를 fixed로 쓰면 pb 추가)
        ].join(" ")}
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/interview/select" element={<Select />} />
          <Route path="/interview/resume" element={<ResumeUploadPage />} />
          <Route path="/interview/questions" element={<QuestionListPage />} />
          <Route path="/interview/calibration" element={<Calibration />} />
        </Routes>
      </div>

      {/* 하단 공용 Footer */}
      {showFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppInner />
      </Router>

      <Toaster toastOptions={{ style: { fontSize: "13px" } }} />
    </AuthProvider>
  );
}
