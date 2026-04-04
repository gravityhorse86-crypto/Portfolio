export default function Signup() {
  return (
    <>
      <h1>新規登録</h1>
      <p>アカウントを作成してください。</p>
      <ul>
        <li>
          ID
          <input type="text" name="id" />
        </li>
        <li>
          パスワード
          <input type="password" name="password" />
        </li>
        <li>
          ユーザー名
          <input type="text" name="username" />
        </li>
        <li>
          メールアドレス
          <input type="email" name="email" />
        </li>
      </ul>
      <button>新規登録</button>
      <button>すでにアカウントをお持ちの方</button>
    </>
  );
}
