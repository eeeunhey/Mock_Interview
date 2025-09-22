# main.py
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

app = FastAPI()

# CORS (개발 편의용)
app.add_middleware(
    CORSMiddleware,     # 배포 시엔 도메인 제한 권장
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True, "ts": datetime.utcnow().isoformat()}

# ✅ 값 전달만 확인용: 파일 저장 없음, 받은 값 echo + 콘솔 출력
@app.post("/video/upload")
async def upload_video(
    interviewNo: str = Form(...),
    questionNo: str = Form(...),
    file: UploadFile = File(...),
):
    # --- 콘솔에 찍기 ---
    print("📌 [UPLOAD] interviewNo:", interviewNo)
    print("📌 [UPLOAD] questionNo :", questionNo)
    print("📌 [UPLOAD] file.name  :", file.filename)
    print("📌 [UPLOAD] file.type  :", file.content_type)

    # --- 그대로 응답 ---
    return {
        "ok": True,
        "message": "값이 정상적으로 전달되었습니다.",
        "received": {
            "interviewNo": interviewNo,
            "questionNo": questionNo,
            "filename": file.filename,
            "content_type": file.content_type,
        },
    }
