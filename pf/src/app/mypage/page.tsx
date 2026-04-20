export default function Mypage() {
  return (
    <>
      <header>
        <button>ログアウト</button>
      </header>
      <main>
        <div>
          <span>成績</span>
          <ul>
            <li>これまでに暗唱した数：〇〇</li>
            <li>1ヶ月内に暗唱した数：〇〇</li>
            <li>現在のランク：〇〇</li>
          </ul>
        </div>
        <button>暗唱文一覧</button>
        <button>暗唱文作成</button>
      </main>
      <footer>
        <button>ユーザー情報編集</button>
      </footer>
    </>
  );
}
