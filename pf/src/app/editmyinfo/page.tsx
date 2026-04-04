export default function EditMyInfo() {
  return (
    <>
      <h1>ユーザー情報編集</h1>
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
      <button>更新</button>

    </>
  );
}
