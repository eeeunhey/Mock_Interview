//
// fetcher는 데이터 가져오기 함수

// SWR 에게 API에서 데이터 가져올 때 함수를 사용해라 라는 의미
import axios from "axios";

const fetcher = (url) => fetch(url).then((res) => res.json());
// axios.get(url) -> url 얻어오기
// res.data 꺼내기 -> 응답받은 데이터를  SWR 에게 넘긴다
