// src/pages/interview/Calibration.jsx                       // 파일 위치(알기 쉽게 표시)

import React, { useCallback, useEffect, useRef, useState } from "react"; // 리액트에서 필요한 도구들(훅)을 가져와요.
import { useNavigate } from "react-router-dom";                            // 다른 페이지로 이동할 때 쓰는 도구예요.


// ===== 설정 =====                                                    // 이 아래는 숫자/문자 같은 설정값들이에요.
const NEXT_PATH = "/interview/run/:sessionId"; // 저장 후 이동할 경로           // 다음으로 이동할 주소(지금은 예시로 :sessionId가 적혀 있어요).
const CALIB_OVERLAY_DELAY_MS = 3000;   // 캘리브레이션 후 오버레이까지 대기     // 3초 기다렸다가 화면 안내(오버레이)를 보여줄 거예요.
const RECORD_DURATION_MS = 3000;       // 저장할 영상 길이                      // 3초 동안 짧은 영상을 녹화해서 저장해요.

// MediaRecorder 지원 체크                                           // 브라우저가 영상 녹화를 지원하는지 확인하는 함수예요.
function isTypeSupported(type) {
  try {
    return typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type); // MediaRecorder가 있고, 그 타입을 지원하면 true
  } catch {
    return false; // 혹시 에러가 나면 false로
  }
}
const FALLBACK_WEBM_VP9 = "video/webm; codecs=vp9"; // 녹화 파일 형태(형식) 후보 1
const FALLBACK_WEBM_VP8 = "video/webm; codecs=vp8"; // 녹화 파일 형태(형식) 후보 2
const FALLBACK_WEBM = "video/webm";                 // 녹화 파일 형태(형식) 후보 3(가장 기본)

// 체크리스트 항목                                                    // 사용자가 준비했는지 체크할 목록이에요.
const CHECKS = [
  { id: "framing", label: "눈/카메라 라인 프레이밍 정렬" },      // 얼굴 위치 맞추기
  { id: "eye", label: "시선 정면 유지 (면접관 응시)" },          // 카메라를 바라보기
  { id: "noise", label: "상대 잡음 조정 · 불필요 최소화" },       // 주변 소음 줄이기
  { id: "light", label: "배경 정리 · 조명 준비" },               // 배경 정리/밝기 맞추기
];

const Calibration = () => {                            // Calibration이라는 화면 컴포넌트를 만들어요.
  const navigate = useNavigate();                     // 버튼 눌렀을 때 다른 페이지로 이동하려고 준비해요.

  // 체크리스트                                              // 체크박스(준비 완료 표시)들의 상태를 저장해요.
  const [checks, setChecks] = useState({
    framing: false,                                   // 처음엔 다 false(미완료)
    eye: false,
    noise: false,
    light: false,
  });

  // 캘리브레이션 상태                                       // 진행 상태를 기억해요.
  const [calibStarted, setCalibStarted] = useState(false); // 시작 버튼을 눌렀는지?
  const [calibCooling, setCalibCooling] = useState(false); // 3초 대기(쿨다운) 중인지?
  const [cooldownLeft, setCooldownLeft] = useState(0);     // 몇 초 남았는지 숫자
  const [showOverlay, setShowOverlay] = useState(false);   // 화면 안내(오버레이) 보여줄지?
  const [isRecording, setIsRecording] = useState(false);   // 지금 녹화 중인지?

  // 미디어                                                    // 비디오/오디오 관련 준비물들이에요.
  const videoRef = useRef(null);                           // <video> 태그를 직접 만지기 위한 손잡이(참조)
  const [stream, setStream] = useState(null);              // 카메라+마이크에서 받은 실제 영상/소리 데이터(스트림)
  const mediaRecorderRef = useRef(null);                   // 녹화 도구(MediaRecorder)를 저장해 둘 자리
  const recordedTypeRef = useRef("");                      // 어떤 파일 형식으로 녹화했는지 기억

  // 권한 요청                                                  // 카메라/마이크 사용 허락을 요청하고 실제로 켜는 함수예요.
  const getMediaPermission = useCallback(async () => {
    const s = await navigator.mediaDevices.getUserMedia({ audio: true, video: true }); // 브라우저에 "카메라/마이크 써도 돼?" 물어보기
    setStream(s);                                           // 받아온 스트림을 상태에 저장
    if (videoRef.current) videoRef.current.srcObject = s;   // 비디오 태그에 스트림을 연결해서 화면에 보이게 해요.
    return s;                                               // 나중에 쓰려고 s를 돌려줘요(리턴)
  }, []);                                                   // []: 이 함수는 항상 같은 걸로 유지(메모이제이션)

  // 언마운트 시 트랙 정리                                        // 이 화면에서 나갈 때 카메라/마이크를 꼭 꺼요(자원 정리).
  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop()); // 켜져있는 모든 트랙(영상/소리)을 멈춤!
    };
  }, [stream]);                                                // stream이 바뀌면 정리 함수도 최신 걸로 준비

  // stream/video 갱신 시 자동재생                                  // 스트림이 생기면 비디오 자동 재생되게 해요.
  useEffect(() => {
    if (!stream) return;                                       // 스트림이 없으면 아무것도 안 해요.
    const v = videoRef.current;                                // 비디오 태그를 꺼내요.
    if (!v) return;                                            // 없다면 종료.
    if (v.srcObject !== stream) v.srcObject = stream;          // 아직 안 연결돼 있으면 스트림을 연결!
    v.muted = true;                                            // 에코(울림) 방지하려고 음소거.
    v.play?.().catch(() => {});                                // 재생을 시도. 실패해도 조용히 무시.
  }, [stream]);                                                // stream이 바뀔 때마다 실행

  // 파일 저장                                                     // 녹화된 영상을 파일로 내려받게 해주는 함수예요.
  const saveBlobLocally = (blob, filename) => {
    const url = URL.createObjectURL(blob);                     // 메모리에 임시 주소를 만들고
    const a = document.createElement("a");                     // 보이지 않는 <a> 태그를 만들고
    a.href = url;                                              // 그 주소를 달아주고
    a.download = filename;                                     // 파일 이름을 정해서
    a.click();                                                 // 자동으로 클릭! → 다운로드 시작
    URL.revokeObjectURL(url);                                  // 임시 주소는 이제 지워서 깔끔하게
  };

  // 캘리브레이션 버튼 클릭                                         // "Start Calibration" 버튼을 눌렀을 때 하는 일
  const onCalibrationStart = async () => {
    try {
      setCalibStarted(true);                                   // 시작했다고 표시
      setShowOverlay(false);                                   // 오버레이(검은 안내창)는 잠깐 숨겨요.
      if (!stream) await getMediaPermission();                 // 아직 권한/스트림 없으면 지금 받기

      setCalibCooling(true);                                   // 3초 준비(쿨다운) 시작!
      setCooldownLeft(CALIB_OVERLAY_DELAY_MS / 1000);          // 남은 시간을 초 단위로 넣기(3초)
      const timer = setInterval(() => {                        // 1초마다 한 번씩 실행하는 타이머
        setCooldownLeft((s) => {                               // s는 현재 남은 초
          if (s <= 1) {                                        // 마지막 1초가 끝나면
            clearInterval(timer);                              // 타이머 멈추고
            setCalibCooling(false);                            // 쿨다운 끝
            setShowOverlay(true);                              // 이제 오버레이(안내창) 보여주기
            return 0;                                          // 남은 시간 0
          }
          return s - 1;                                        // 아직이면 1초 줄이기
        });
      }, 1000);                                                // 1000ms = 1초
    } catch (e) {
      console.error(e);                                        // 개발자 콘솔에 에러 보여주기
      alert(`캘리브레이션 오류: ${e.message ?? ""}`);          // 사용자에게도 알려주기
      setCalibStarted(false);                                  // 상태들 원래대로 되돌리기
      setCalibCooling(false);
      setCooldownLeft(0);
      setShowOverlay(false);
    }
  };

  // 면접 시작 버튼 클릭                                             // "면접 시작" 버튼을 누르면 짧게 녹화하고 저장한 뒤 다음 화면으로 가요.
  const onClickStartInterview = async () => {
    if (calibCooling || !calibStarted || isRecording) return;  // 아직 준비 중이거나 시작 안 했거나 이미 녹화 중이면 아무것도 안 해요.

    try {
      if (!stream) await getMediaPermission();                 // 스트림 없으면 지금 받기
      setIsRecording(true);                                    // 이제부터 녹화 중!

      if (typeof window.MediaRecorder === "undefined") {       // 브라우저가 녹화 기능을 모르면
        throw new Error("이 브라우저는 MediaRecorder를 지원하지 않습니다."); // 에러로 알려요.
      }

      const tryTypes = [FALLBACK_WEBM_VP9, FALLBACK_WEBM_VP8, FALLBACK_WEBM]; // 가능한 파일 형식 후보들
      let rec = null;                                          // 녹화 도구를 담을 변수
      let usedType = "";                                       // 실제로 쓴 형식 기억
      for (const t of tryTypes) {                              // 후보들을 하나씩 검사
        if (isTypeSupported(t)) {                              // 지원하면
          rec = new MediaRecorder(stream, { mimeType: t });    // 그 형식으로 녹화기를 만들고
          usedType = t;                                        // 사용 형식 저장
          break;                                               // 검사 끝!
        }
      }
      if (!rec) {                                              // 후보 중에 되는 게 하나도 없으면
        rec = new MediaRecorder(stream);                       // 형식 없이 기본으로 시도
        usedType = rec.mimeType || "";                         // 브라우저가 정한 형식을 적어둬요.
      }
      recordedTypeRef.current = usedType;                      // 나중 저장할 때 쓰려고 기록
      mediaRecorderRef.current = rec;                          // 혹시 필요하면 밖에서도 쓸 수 있게 참조에 저장

      const chunks = [];                                       // 녹화하면서 잘린 조각들을 담는 상자
      rec.ondataavailable = (e) => {                           // 새로운 조각이 생길 때마다
        if (e.data && e.data.size > 0) chunks.push(e.data);    // 조각을 모아둬요.
      };

      rec.onstop = () => {                                     // 녹화가 완전히 끝나면 실행되는 함수
        try {
          const type = recordedTypeRef.current || chunks[0]?.type || "video/webm"; // 파일 형식 정하기(기록된 거→조각→기본 순)
          const merged = new Blob(chunks, { type });           // 조각들을 하나로 합쳐서 큰 덩어리(Blob) 만들기
          saveBlobLocally(merged, `calibration_${Date.now()}.webm`); // 파일로 저장(다운로드) 시작!
        } catch (e) {
          console.error(e);                                    // 에러 나면 개발자 콘솔에 보여주고
          alert(`저장 오류: ${e.message ?? ""}`);              // 사용자에게도 알려요.
        } finally {
          setIsRecording(false);                               // 녹화 상태 해제
          navigate(NEXT_PATH);                                 // 다음 화면으로 이동(지금은 예시 경로)
        }
      };

      rec.start();                                             // 녹화 시작!
      setTimeout(() => {                                       // RECORD_DURATION_MS(3초) 후에
        if (rec && rec.state !== "inactive") rec.stop();       // 아직 녹화 중이면 멈추기
      }, RECORD_DURATION_MS);
    } catch (e) {
      console.error(e);                                        // 문제 생기면 콘솔에 출력
      alert(e.message ?? "면접 시작 중 오류 발생");            // 사용자에게도 알려주고
      setIsRecording(false);                                   // 녹화 상태 해제
    }
  };

  return (                                                      // 여기부터 화면에 보이는 부분(JSX)이에요.
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">   // 화면 전체 높이 + 밝은 회색 배경 + 세로 배치

      <main className="flex-1">                                 // 본문 영역(남은 공간을 다 차지)
        <div className="mx-auto w-full max-w-6xl px-4 py-8">    // 가운데 정렬 + 가로 최대폭 + 여백
          <div className="grid grid-cols-12 gap-6">             // 12칸 그리드로 배치, 칸 사이 간격 6

            {/* 왼쪽: 라이브 미리보기 */}                       {/* 주석: 왼쪽 영역엔 카메라 미리보기를 보여줘요. */}
            <div className="col-span-12 lg:col-span-8">         // 모바일에선 12칸 모두, 큰 화면에선 8칸 차지
              <div className="rounded-xl border bg-white p-6">  // 하얀 카드 모양 상자
                <div className="flex items-center justify-between mb-4"> // 위쪽 타이틀줄(양 끝 배치)
                  <h2 className="font-semibold">Calibration</h2> // 제목
                  <button                                         // 캘리브레이션 시작/다시하기 버튼
                    onClick={onCalibrationStart}                   // 누르면 onCalibrationStart 실행
                    disabled={calibCooling}                        // 쿨다운 중이면 비활성화
                    className={`h-9 px-3 rounded ${
                      calibCooling ? "bg-slate-200 text-slate-500" : "bg-blue-600 text-white"
                    }`}
                  >
                    {calibStarted                                 // 버튼 안의 글자: 상태에 따라 바뀜
                      ? (calibCooling ? `준비중... ${cooldownLeft}s` : "Re-Calibrate")
                      : "Start Calibration"}
                  </button>
                </div>

                <div className="relative bg-black overflow-hidden rounded-xl"> // 비디오가 들어가는 검은 배경 상자
                  <div className="w-full aspect-video">                        // 16:9 비율 박스
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" /> // 비디오 표시
                  </div>

                  {/* 중앙 프레이밍 가이드 */}                 {/* 아직 오버레이를 안 보일 땐 얼굴 가운데 맞추는 가이드를 보여줘요. */}
                  {!showOverlay && (
                    <div className="pointer-events-none absolute inset-0 grid place-items-center z-20">
                      <div className="relative w-[260px] h-[260px] rounded-full border-2 border-white/70"> // 동그란 테두리
                        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[2px] bg-white/60" /> // 가운데 선
                        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
                          <span className="text-white text-sm font-medium leading-snug drop-shadow">
                            얼굴을 화면 중앙에{"\n"}맞춰주세요                         // 안내 문구
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 오버레이 */}                                {/* 준비가 끝나면 화면을 살짝 어둡게 하고 안내 문구를 보여줘요. */}
                  {showOverlay && (
                    <div className="absolute inset-0 bg-black/65 grid place-items-center rounded-xl z-30">
                      <div className="text-center text-white">
                        <p className="text-lg font-semibold mb-1">면접 시작 버튼을 눌러주세요</p> // 큰 안내
                        <p className="text-sm opacity-80">체크리스트를 확인한 후 진행하세요</p>    // 추가 안내
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 text-xs text-slate-500">   // 아래쪽 작은 상태 표시줄
                  {calibStarted
                    ? calibCooling
                      ? "Calibration: 준비 중..."               // 3초 카운트다운 중
                      : "Calibration: 준비 완료"                // 준비 끝
                    : "Calibration: 대기"}                      // 아직 시작 안 함
                </div>
              </div>
            </div>

            {/* 오른쪽: 체크리스트 & 면접 시작 */}              {/* 오른쪽 영역엔 체크박스와 '면접 시작' 버튼이 있어요. */}
            <div className="col-span-12 lg:col-span-4 space-y-6"> // 모바일에선 12칸, 큰 화면에선 4칸
              <div className="rounded-xl border bg-white p-6">    // 체크리스트 카드
                <h3 className="font-semibold mb-4">체크리스트</h3>
                <div className="space-y-3 text-sm">
                  {CHECKS.map((c) => (                          // CHECKS 배열을 돌면서 체크박스를 만들어요.
                    <label key={c.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name={c.id}
                        checked={checks[c.id]}                  // 현재 상태에 맞춰 체크/해제
                        onChange={(e) =>
                          setChecks((prev) => ({ ...prev, [c.id]: e.target.checked })) // 체크하면 상태 업데이트
                        }
                        className="h-4 w-4"
                      />
                      <span>{c.label}</span>                    // 체크박스 옆 글자
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border bg-white p-6">    // '면접 시작' 안내와 버튼 카드
                <div className="text-xs text-slate-500 mb-3">완료 준비</div>
                <p className="text-sm text-slate-600 mb-4">
                  캘리브레이션 버튼을 누른 후 3초 뒤 안내가 표시되면, 면접을 시작할 수 있어요.
                </p>
                <button
                  onClick={onClickStartInterview}                // 누르면 녹화→저장→다음 페이지로
                  disabled={calibCooling || !calibStarted || isRecording} // 아직 준비 중/시작 안함/녹화 중이면 못 눌러요.
                  className={`h-10 px-4 rounded-lg w-full ${
                    !calibCooling && calibStarted && !isRecording
                      ? "bg-blue-600 text-white"                 // 가능할 땐 파란색 활성화
                      : "bg-slate-200 text-slate-500 cursor-not-allowed" // 아니면 회색 비활성화
                  }`}
                >
                  {isRecording ? "저장 중..." : "면접 시작"}     // 녹화 끝나고 저장 중일 땐 '저장 중...'
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default Calibration;                                     // 이 컴포넌트를 다른 파일에서 쓸 수 있게 내보내요.
