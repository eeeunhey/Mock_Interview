// ✅ 파일 업로드 설정(multer)
// - 저장 경로/파일명/허용 MIME/용량 제한 등을 정의

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";

// 업로드 디렉토리가 없으면 생성
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// 저장소 설정: 디스크에 저장
const storage = multer.diskStorage({
  // 파일이 저장될 디렉토리
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),

  // 저장될 파일명: 현재시각-원본파일명 (중복/충돌 최소화)
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

// 허용할 MIME 타입 화이트리스트
const allowed = new Set([
  "application/pdf",                                                         // PDF
  "application/msword",                                                      // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",// .docx
  "text/plain",                                                              // .txt
]);

// 파일 필터: 허용 형식이 아니면 에러
function fileFilter(req, file, cb) {
  if (allowed.has(file.mimetype)) cb(null, true);
  else cb(new Error("Unsupported file type"), false);
}

// multer 인스턴스 생성: 저장소/필터/용량 제한
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 최대 10MB
});

module.exports = upload;
