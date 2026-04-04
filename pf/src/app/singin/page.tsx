export default function Signin() {
  return (
   <>
    <h1>ようこそ</h1>
    <p>ログインしてください。</p>
    <ul>
      <li>ID
        <input type="text" name="id" />
      </li>
      <li>パスワード
        <input type="password" name="password" />
      </li>
    </ul>
    <button>ログイン</button>
    <h2>アカウントをお持ちでない方</h2>
    <button>新規登録</button>
   </> 
  );
  }