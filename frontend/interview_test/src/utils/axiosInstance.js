import axios from "axios";
import { BASE_URL } from "./apiPaths";


// 서버랑 통신하는 코드
// instance 서버랑 통신하는데 이러이러할 떄 통신해 하고 지정해놈

const axiosInstance = axios.create({
  baseURL: BASE_URL, // 개발: "/api", 배포: 공인 도메인으로 ENV 지정
  timeout: 80000, // 응답 시간
  headers: { "Content-Type": "application/json", Accept: "application/json" }, // 기본 함께 보낼 정보
  // 쿠키 세션 쓰면 아래도 켜기
  // withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}); // 토큰값이 있는지 확인하고 통신해라


axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error?.config?.url || "";
    const status = error?.response?.status;
    // 돌아오는 응답이 성공이냐 실패냐 따라 나누자

    // ✅ 네트워크 자체가 실패(타임아웃/미도달)일 때
    if (error.request && !error.response) {
      console.error("[Network] 서버 응답 없음(프록시/서버/CORS/경로 확인).");
      return Promise.reject(error);
    } //서버에서 응답이 없을 때 응답하는 내용

    // ✅ 인증 API는 401 처리 제외
    const isAuthApi = /\/user\/(login|register)$/i.test(url);
    if (status === 401 && !isAuthApi) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/") window.location.href = "/";
    } else if (status === 500) {
      console.error("서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    }
    return Promise.reject(error);
  } // 토큰이 유효하지 않은 경우 응답 토큰 삭제 홈으로 강제 이동 
); 

export default axiosInstance;
