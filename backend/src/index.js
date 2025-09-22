// ✅ 서버의 진입 파일: Express 앱 생성/미들웨어 장착/라우트 연결/서버 리스닝

const path = require("path");               // 경로 조작 유틸 (정적 파일 경로 등)
const fs = require("fs");                   // 파일 시스템 접근 (업로드 폴더 생성)
require("dotenv").config();                 // .env 로드 (PORT/UPLOAD_DIR 등 환경변수 사용)
const express = require("express");         // Express 프레임워크
const cors = require("cors");               // CORS 허용 미들웨어
const morgan = require("morgan");           // HTTP 요청 로깅 미들웨어

const resumeRoutes = require("./routes/resume");        // 예시: 기존 /api 라우트
const calibrationRoutes = require("./routes/calibration"); // ✅ 캘리브레이션 업로드 라우트

const app = express();                      // Express 앱 인스턴스 생성
const PORT = process.env.PORT || 3000;      // 포트 번호: .env → 기본 3000
const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads"; // 업로드 폴더 경로
const FRONTENDS = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// 업로드 폴더가 없으면 생성 (서버 시작 시 1회)
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// CORS 허용 (프론트엔드 도메인과 다르면 브라우저에서 막히므로 열어줌)
// - 실제 서비스에서는 origin 옵션으로 특정 도메인만 허용하는 게 안전
// - 커스텀 헤더 x-session-id 를 허용해 업로드 시 세션ID 전달 가능
app.use(
  cors({
    origin: FRONTENDS.length ? FRONTENDS : true, // .env에 CORS_ORIGIN 있으면 그 도메인만 허용, 없으면 모두 허용(true)
    credentials: false,                           // 쿠키 사용 안 하면 false
    allowedHeaders: ["Content-Type", "x-session-id"], // ✅ 세션 헤더 허용
  })
);

// JSON 파싱 미들웨어 (요청 Body가 application/json일 때 req.body에 파싱 결과 할당)
// - limit: 요청 본문 크기 제한(2MB) — 필요에 따라 조정
app.use(express.json({ limit: "2mb" }));

// (선택) application/x-www-form-urlencoded 파싱 — 필요 시 활성화
// app.use(express.urlencoded({ extended: true }));

// 요청 로깅 (개발 시 유용: 메서드/경로/상태코드/응답시간 등 출력)
app.use(morgan("dev"));

// 업로드된 파일을 정적으로 서빙 (브라우저에서 /uploads/파일명 접근 가능)
// - 예: http://localhost:3000/uploads/169xxxx-resume.pdf
app.use("/uploads", express.static(path.resolve(UPLOAD_DIR)));

// 헬스체크 (배포/모니터링용)
app.get("/health", (_req, res) => res.json({ ok: true }));

// 실제 API 라우트 연결
app.use("/api", resumeRoutes);                // 예시: 기존 묶음 라우트
app.use("/api/calibration", calibrationRoutes); // ✅ 캘리브레이션 업로드 라우트

// 404 핸들러: 위의 모든 라우트에 매칭되지 않으면 여기로 옴
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// 에러 핸들러: 라우트/미들웨어에서 throw된 에러를 받아 통일된 응답으로 처리
app.use((err, req, res, next) => {
  console.error(err);                                         // 서버 콘솔에 에러 출력(디버깅)
  const status = err.status || 500;                           // 상태코드 (없으면 500)
  res.status(status).json({ error: err.message || "Server error" }); // 에러 메시지 JSON
});

// 서버 시작: 지정 포트에서 HTTP 요청 수신 대기
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
