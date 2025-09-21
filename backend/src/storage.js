// ✅ 간단한 '메모리 저장소' 모듈 (데모용)
// - 서버 재시작하면 내용이 사라짐. 실제 서비스에서는 DB로 교체 필요.

const { v4: uuidv4 } = require("uuid");

// Map을 사용해 resumeId → 데이터 객체를 저장
// 구조: { title, text, filePath, originalName, createdAt, updatedAt }
const store = new Map();

// 새 resumeId 생성 (예: rsm_ab12cd34 형태)
// - uuidv4로 고유값 생성 후 앞부분만 사용해 가독성↑
function newId() {
  return "rsm_" + uuidv4().slice(0, 8);
}

// 텍스트로 자소서 생성
// - text: 본문 텍스트 문자열
// - return: 생성된 resumeId
function createFromText(text) {
  const id = newId();
  const now = new Date().toISOString();
  store.set(id, {
    title: null,              // 제목은 아직 없음(별도 API로 업데이트)
    text,                     // 텍스트 원문
    filePath: null,           // 파일 업로드가 아니므로 null
    originalName: null,       // 원본 파일명 없음
    createdAt: now,
    updatedAt: now
  });
  return id;
}

// 파일로 자소서 생성
// - filePath: 서버에 저장된 파일 경로
// - originalName: 사용자가 올린 원래 파일명
// - return: 생성된 resumeId
function createFromFile(filePath, originalName) {
  const id = newId();
  const now = new Date().toISOString();
  store.set(id, {
    title: null,              // 제목은 아직 없음
    text: null,               // 텍스트가 아닌 파일 업로드 케이스
    filePath,                 // 저장된 파일 경로
    originalName,             // 원본 파일명
    createdAt: now,
    updatedAt: now
  });
  return id;
}

// 특정 resumeId로 저장된 객체 조회
function getResume(id) {
  return store.get(id) || null;
}

// 제목 업데이트
// - id: resumeId
// - title: 새 제목
// - return: { resumeId, title, updatedAt } (API 응답 형태 맞춤)
function setTitle(id, title) {
  const item = store.get(id);
  if (!item) return null;             // 없는 경우 호출부에서 404 처리

  const now = new Date().toISOString();
  item.title = title;                 // 제목 변경
  item.updatedAt = now;               // 수정 시각 갱신
  store.set(id, item);                // Map에 다시 세팅(불변성 유지 관점에선 복사도 가능)

  return { resumeId: id, title: item.title, updatedAt: item.updatedAt };
}

module.exports = {
  createFromText,
  createFromFile,
  getResume,
  setTitle,
};
