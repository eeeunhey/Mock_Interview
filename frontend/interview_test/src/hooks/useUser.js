import useSWR from "swr";
import { fetcher } from "../utils/fetcher";
// useSWR : 데이터를 자동으로 가져오고, 캐시(저장)도 해주고, 새로고침도 알아서 해주는 도구
// fetcher : 실제로 서버에 "데이터 주세요!" 하고 요청을 보내는 함수 (axios.get으로 만든 것)


// "사용자 정보" 전용 훅
export function useUser() {
  const { data, error, isLoading } = useSWR("/api/user", fetcher);
  // /api/user 주소로 서버에 요청 보내기
  // fetcher가 서버랑 대화하는 역할
  // data → 성공하면 사용자 정보가 들어옴
  // error → 실패하면 에러가 들어옴
  // isLoading → 아직 대답 기다리는 중이면 true


  return {
    user: data,    //user → 실제 사용자 정보
    isLoading,      // isLoading → 로딩 중인지 알려주는 값
    isError: error, //isError → 에러 났는지 알려주는 값
  };

}