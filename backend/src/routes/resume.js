// ✅ 라우터: 실제 API 엔드포인트들을 정의
// - POST /api/resumes/text        : 텍스트 업로드 → resumeId 반환
// - POST /api/resumes/upload      : 파일 업로드 → resumeId 반환
// - PATCH /api/resumes/:id/title  : 제목만 업데이트 → { resumeId, title, updatedAt }
// - POST /api/interview/from-resume : resumeId 기준으로 질문 n개 생성(데모 응답)

const express = require("express");
const router = express.Router();

const upload = require("../upload");                     // multer 설정(파일 업로드)
const { createFromText, createFromFile, getResume, setTitle } = require("../storage");

// POST /api/resumes/text
// Body(JSON): { text: "자소서 본문" }
// Res(JSON) : { resumeId: "rsm_xxx" }
router.post("/resumes/text", (req, res) => {
  const text = (req.body?.text || "").trim();           // 공백 제거
  if (!text) return res.status(400).json({ error: "text is required" }); // 필수값 검사

  const resumeId = createFromText(text);                 // 메모리에 생성/저장
  res.json({ resumeId });                                // 생성된 id 반환
});

// POST /api/resumes/upload
// FormData: file(필드명 "file")
// Res(JSON): { resumeId: "rsm_xxx" }
router.post("/resumes/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "file is required" }); // 파일 없으면 400

  // multer가 저장한 파일 경로/원본명으로 메모리에 레코드 생성
  const resumeId = createFromFile(req.file.path, req.file.originalname);
  res.json({ resumeId });
});

// PATCH /api/resumes/:resumeId/title
// Body(JSON): { title: "새 제목" }  ← Body에는 title만!
// Res(JSON) : { resumeId, title, updatedAt }
router.patch("/resumes/:resumeId/title", (req, res) => {
  const { resumeId } = req.params;                      // URL 경로에서 id 추출
  const title = (req.body?.title || "").trim();         // Body에서 title 추출(공백 제거)

  if (!title) return res.status(400).json({ error: "title is required" }); // 필수값 검사

  const found = getResume(resumeId);                    // 메모리에서 조회
  if (!found) return res.status(404).json({ error: "resume not found" });  // 없으면 404

  const result = setTitle(resumeId, title);             // 제목 갱신
  res.json(result);                                     // { resumeId, title, updatedAt }
});

// POST /api/interview/from-resume
// Body(JSON): { resumeId: "rsm_xxx", topK: 10 }
// Res(JSON) : { ok: true, count: 10 }
router.post("/interview/from-resume", (req, res) => {
  const { resumeId, topK } = req.body || {};            // Body 파싱
  const found = getResume(resumeId);                    // 존재 여부 확인
  if (!found) return res.status(404).json({ error: "resume not found" });

  // topK 숫자화 (없으면 디폴트 10)
  const n = Number.isFinite(topK) ? Number(topK) : 10;

  // 여기서는 데모로 count만 돌려줌.
  // 실제 서비스라면 resumeId로 찾아 텍스트/파일을 파싱 → 질문 생성 로직 수행.
  res.json({ ok: true, count: n });
});

module.exports = router;
