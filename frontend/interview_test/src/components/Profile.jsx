import { useUser } from "../hooks/useUser";
// 저장된 user 훅을 가져온다

export default function Profile() {
  const { user, isLoading, isError } = useUser();
  // user 값에 

  if (isLoading) return <p>⏳ 로딩중...</p>;
  if (isError) return <p>❌ 에러 발생!</p>;

  return (
    <div>
      <h1>{user.name} 님</h1>
      <p>이메일: {user.email}</p>
    </div>
  );
}
