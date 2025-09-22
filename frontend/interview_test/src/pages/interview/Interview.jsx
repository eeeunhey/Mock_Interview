// 필요한 것들을 가져오기(수입하기)
import React, { useEffect, useState } from "react"; // 화면 그리기, 값 저장(State), 특정 때 실행(useEffect) 쓰려고
import axiosInstance from "../../utils/axiosInstance";     // 서버에 요청 보낼 때 쓰는 axios(우리 프로젝트용 설정) 가져오기
import { API_PATHS } from "../../utils/apiPaths";          // 서버 주소 모아둔 표(경로 상수들)
import { useNavigate } from "react-router-dom";            // 다른 화면으로 이동할 때 쓰는 도구

// 탭(버튼) 목록 만들기: 세 가지 종류의 질문을 보여줄 거야
const TABS = [
  { key: "COMMON", label: "공통 면접 질문" },     // 모든 사람이 연습하는 공통 질문
  { key: "RESUME", label: "자소서 기반 질문" },   // 자소서(이력서) 내용을 바탕으로 만든 질문
  { key: "CUSTOM", label: "커스텀 질문" },        // 내가 직접 만든 질문
];

// 이 파일의 메인 화면(컴포넌트) 시작!
export default function QuestionListPage() {
  const nav = useNavigate(); // 다른 페이지로 이동시키는 버튼 같은 것

  // 선택한 질문들을 담는 상자(배열). 한 개씩 {questionId, text, source} 모양으로 넣어.
  const [selected, setSelected] = useState([]); // 예: [{questionId:'1', text:'자기소개', source:'COMMON'}]

  // 지금 어떤 탭을 보고 있는지 기억. 처음엔 첫 번째 탭("COMMON")
  const [tab, setTab] = useState(TABS[0].key);

  // 공통/자소서 질문 목록을 담는 상자
  const [items, setItems] = useState([]);

  // 커스텀 질문 목록 + 입력창에 적는 글(draft)
  const [customItems, setCustomItems] = useState([]);
  const [draft, setDraft] = useState("");   // 내가 직접 적는 질문의 임시 글
  const [busy, setBusy] = useState(false);  // 버튼 여러 번 못 누르게 바쁨 표시
  const [loading, setLoading] = useState(false); // 서버에서 목록 가져오는 중인지 표시

  // 탭이 바뀔 때마다(예: COMMON → RESUME) 해당 탭의 질문 목록을 서버에서 가져와요
  useEffect(() => {
    const ac = new AbortController(); // 중간에 페이지가 바뀌면 요청을 취소하려고 만드는 도구
    const run = async () => {         // 서버에서 데이터 가져오는 일을 비동기로 하기
      setLoading(true);               // "불러오는 중…" 표시 켜기
      try {
        if (tab === "CUSTOM") {       // 커스텀 탭이면
          const { data } = await axiosInstance.get(API_PATHS.CUSTOM_QUESTIONS, {
            signal: ac.signal,        // 취소할 수 있게 신호 넣기
          });
          // 혹시 서버가 다른 이름(id/content)으로 줄 수도 있어서 안전하게 바꿔 담기(매핑)
          const arr = Array.isArray(data) ? data : [];
          setCustomItems(
            arr.map((d) => ({
              // 여러 이름 중 하나라도 있으면 그걸로 ID 정하기(없으면 빈 문자열)
              questionId: d.questionId ?? d.id ?? d.uuid ?? String(d?.id ?? ""),
              // 질문 글자는 text가 없으면 content를, 그것도 없으면 빈 문자열
              text: d.text ?? d.content ?? "",
              source: d.source ?? "CUSTOM", // 출처는 커스텀으로
            }))
          );
        } else { // COMMON 또는 RESUME 탭이면
          const { data } = await axiosInstance.get(
            `${API_PATHS.QUESTIONS}?source=${encodeURIComponent(tab)}&limit=50`, // 예: /questions?source=COMMON
            { signal: ac.signal }
          );
          const arr = Array.isArray(data) ? data : [];
          setItems(
            arr.map((d) => ({
              questionId: d.questionId ?? d.id ?? d.uuid ?? String(d?.id ?? ""),
              text: d.text ?? d.content ?? "",
              source: d.source ?? tab, // 출처는 현재 탭 이름으로
            }))
          );
        }
      } catch (e) { // 오류가 나면
        if (ac.signal.aborted) return; // 요청이 취소된 거면 아무것도 안 함
        console.warn("[QuestionList] fetch error:", e); // 개발자 콘솔에 경고 찍기
        if (tab === "CUSTOM") setCustomItems([]); // 목록을 비워서 화면에 "없음" 보여주기
        else setItems([]);
      } finally {
        if (!ac.signal.aborted) setLoading(false); // 로딩 표시 끄기
      }
    };
    run();             // 위에서 만든 비동기 함수 실행
    return () => ac.abort(); // 이 useEffect가 끝날 때(탭 또 바뀌면) 요청 취소!
  }, [tab]); // tab 값이 바뀔 때마다 다시 실행

  // 질문을 클릭해서 선택/해제하기(최대 3개까지)
  function toggleChoice(q) {
    const exists = selected.find((x) => x.questionId === q.questionId); // 이미 선택했는지 확인
    if (exists) {
      // 이미 있으면 빼기(해제)
      setSelected(selected.filter((x) => x.questionId !== q.questionId));
    } else if (selected.length < 3) {
      // 3개 미만이면 추가
      setSelected([...selected, q]);
    } else {
      // 3개 꽉 찼으면 알림
      alert("최대 3개까지 선택할 수 있어요.");
    }
  }

  // 면접 시작 버튼 눌렀을 때(서버에 "세션 만들어줘!"라고 부탁)
  async function onStart() {
    if (selected.length === 0) return; // 하나도 안 골랐으면 종료
    try {
      const questionIds = selected.map((s) => s.questionId); // 선택한 질문들의 ID만 모으기
      const { data } = await axiosInstance.post(API_PATHS.INTERVIEWS, { questionIds }); // 서버에 세션 생성 요청
      const sessionId = data?.sessionId ?? data?.id ?? data?.session?.id; // 여러 이름 중 하나로 세션ID 받기
      if (!sessionId) throw new Error("No session id"); // 세션ID가 없으면 에러
      nav("/interview/devices", { state: { sessionId } }); // 다음 화면으로 이동(기기 테스트), 세션ID 들고 감
    } catch (e) {
      console.warn("[QuestionList] start error:", e); // 개발자 콘솔에 경고
      alert("세션 생성에 실패했어요. 잠시 후 다시 시도해주세요."); // 사용자에게 안내
    }
  }

  // 커스텀 질문 추가하기(내가 입력칸에 쓴 걸 저장)
  async function addCustom() {
    const text = draft.trim(); // 앞뒤 공백 제거
    if (!text) return;         // 비어 있으면 취소
    setBusy(true);             // 바쁨 표시 켜기(버튼 잠깐 비활성화)
    try {
      const { data } = await axiosInstance.post(API_PATHS.CUSTOM_QUESTIONS, { text }); // 서버에 새 질문 추가
      const q = {
        questionId: data?.questionId ?? data?.id ?? String(Date.now()), // 서버가 안 주면 임시로 시간값 사용
        text: data?.text ?? text,   // 서버 응답에 글자가 없으면 내가 쓴 글 그대로
        source: "CUSTOM",           // 출처는 커스텀
      };
      setCustomItems((prev) => [q, ...prev]); // 맨 앞에 새로 추가
      setDraft("");                            // 입력칸 비우기
    } catch (e) {
      console.warn("[QuestionList] add custom error:", e);
      alert("커스텀 질문 추가에 실패했어요.");
    } finally {
      setBusy(false); // 바쁨 표시 끄기
    }
  }

  // 커스텀 질문 삭제하기
  async function removeCustom(q) {
    setBusy(true);
    try {
      await axiosInstance.delete(`${API_PATHS.CUSTOM_QUESTIONS}/${q.questionId}`); // 서버에 삭제 부탁
      setCustomItems((prev) => prev.filter((x) => x.questionId !== q.questionId)); // 화면 목록에서도 제거
      setSelected((prev) => prev.filter((x) => x.questionId !== q.questionId));    // 선택 목록에도 있으면 빼기
    } catch (e) {
      console.warn("[QuestionList] remove custom error:", e);
      alert("삭제에 실패했어요.");
    } finally {
      setBusy(false);
    }
  }

  // 오른쪽 요약칸 3개를 만들기(선택한 질문 3칸 미리보기)
  const slots = [0, 1, 2].map((i) => selected[i] ?? null);

  // 공통/자소서 목록을 보여주는 패널(왼쪽 큰 상자)
  const ListPanel =
    <section className="bg-white border rounded-xl shadow-sm">
      <div className="px-6 pt-5 pb-2 text-xs text-gray-500">선택 가능: 최대 3개</div>
      <div className="px-6 pb-6">
        <div className="border rounded-lg overflow-hidden">
          <ul className="divide-y">
            {loading && items.length === 0 && ( // 불러오는 중일 때
              <li className="p-6 text-sm text-gray-500">불러오는 중…</li>
            )}
            {!loading && items.length === 0 && ( // 로딩 끝났는데 아무것도 없을 때
              <li className="p-6 text-sm text-gray-500">불러올 질문이 없습니다.</li>
            )}
            {items.map((q) => { // 질문 하나씩 줄로 보여주기
              const checked = selected.some((x) => x.questionId === q.questionId); // 선택했는지 체크
              return (
                <li
                  key={q.questionId} // 각 줄에 고유 키
                  className={`p-4 flex items-start gap-3 cursor-pointer ${checked ? "bg-[#F8FAFF]" : "bg-white"}`} // 선택되면 살짝 파랗게
                  onClick={() => toggleChoice(q)} // 줄을 클릭해도 선택 토글
                >
                  <input
                    type="checkbox"
                    checked={checked}                       // 체크박스 상태 맞추기
                    onChange={() => toggleChoice(q)}       // 체크박스 눌러도 토글
                    onClick={(e) => e.stopPropagation()}   // 체크박스 클릭이 li 클릭으로 번지지 않게 막기
                    className="mt-1 h-4 w-4 accent-[#3B82F6]" // 파란색 체크
                  />
                  <p className="text-sm text-gray-800">{q.text}</p> {/* 질문 내용 */}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>;

  // 커스텀 질문 패널(왼쪽 큰 상자) — 내가 직접 질문을 쓰고, 목록으로 관리
  const CustomPanel =
    <section className="bg-white border rounded-xl shadow-sm">
      <div className="px-6 pt-5 pb-2 text-xs text-gray-500">선택 가능: 최대 3개</div>

      <div className="px-6">
        <div className="border rounded-xl p-4">
          <textarea
            placeholder="직접 질문 입력"           // 입력 안내 문구
            className="w-full h-28 border rounded p-3 text-sm" // 입력창 스타일
            value={draft}                          // 입력창의 현재 글자
            onChange={(e) => setDraft(e.target.value)} // 글자가 바뀌면 상태에 저장
          />
          <div className="mt-2 w-full flex justify-end">
            <button
              onClick={addCustom}                              // 추가 버튼 누르면 addCustom 실행
              disabled={!draft.trim() || busy}                 // 비어 있거나 바쁠 땐 비활성화
              className="px-3 h-8 rounded bg-[#3B82F6] text-white text-sm disabled:opacity-50"
            >
              질문 추가
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="mt-4 border rounded-lg overflow-hidden">
          <div className="px-4 py-3 text-sm font-medium text-gray-700">내가 만든 질문</div>
          <ul className="divide-y">
            {loading && customItems.length === 0 && tab === "CUSTOM" && ( // 커스텀 탭에서 불러오는 중
              <li className="p-6 text-sm text-gray-500">불러오는 중…</li>
            )}
            {!loading && customItems.length === 0 && ( // 커스텀 목록이 비어 있을 때
              <li className="p-6 text-sm text-gray-500">등록한 커스텀 질문이 없습니다.</li>
            )}
            {customItems.map((q) => { // 내가 만든 질문들을 줄로 보여주기
              const checked = selected.some((x) => x.questionId === q.questionId);
              return (
                <li key={q.questionId} className="p-4 flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleChoice(q)}  // 체크하면 선택/해제
                    className="mt-1 h-4 w-4 accent-[#3B82F6]"
                  />
                  <p className="flex-1 text-sm text-gray-800">{q.text}</p> {/* 질문 글 */}
                  <button
                    onClick={() => removeCustom(q)}  // 삭제 버튼
                    className="px-3 h-8 text-xs rounded bg-[#3B82F6] text-white"
                    disabled={busy}                  // 바쁠 땐 비활성화
                  >
                    삭제
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>;

  // 화면에 실제로 보여줄 부분(HTML처럼 생긴 JSX)
  return (
    <div className="min-h-screen w-full bg-[#F7FAFC] flex flex-col"> {/* 전체 배경과 레이아웃 */}

      <main className="flex-1"> {/* 본문 영역 */}
        <div className="max-w-[1200px] mx-auto px-4 py-8"> {/* 가운데 정렬 + 여백 */}
          {/* 탭 버튼들 */}
          <div className="flex items-center gap-2 mb-4">
            {TABS.map((t) => ( // 세 개의 탭 버튼 만들기
              <button
                key={t.key}
                onClick={() => setTab(t.key)} // 누르면 해당 탭으로 전환
                className={`px-4 h-9 rounded-full text-sm border ${
                  tab === t.key
                    ? "bg-[#2B6CB0] text-white border-[#2B6CB0]" // 선택된 탭: 파란색
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50" // 안 선택된 탭: 하양
                }`}
              >
                {t.label} {/* 탭 이름 표시 */}
              </button>
            ))}
          </div>

          {/* 왼쪽: 목록 패널 / 오른쪽: 선택 요약 */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            {tab === "CUSTOM" ? CustomPanel : ListPanel} {/* 탭에 따라 왼쪽 내용 바꾸기 */}

            {/* 오른쪽 선택 요약 박스 */}
            <aside className="bg-white border rounded-xl shadow-sm h-max">
              <div className="p-6">
                <h3 className="font-semibold mb-4">선택 요약 ({selected.length}/3)</h3>
                <div className="space-y-3">
                  {slots.map((s, idx) => ( // 3칸에 선택한 질문을 순서대로 채움
                    <div
                      key={idx}
                      className="h-10 rounded-lg border bg-[#F7FAFC] flex items-center px-3 text-sm text-gray-500"
                    >
                      {s ? s.text : "— (선택 시 표시)"} {/* 아직 비었으면 안내 문구 */}
                    </div>
                  ))}
                </div>
                <button
                  className="mt-5 w-28 h-9 rounded bg-[#3B82F6] text-white text-sm disabled:opacity-50"
                  onClick={onStart}                      // 면접 시작!
                  disabled={selected.length === 0}       // 하나도 안 골랐으면 비활성화
                >
                  면접 시작
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>

    </div>
  );
}
