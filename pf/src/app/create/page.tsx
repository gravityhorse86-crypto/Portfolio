export default function Create() {
  return (
    <>
      <div>
        <ul>
          <li>フィルター</li>
          <li>並び替え</li>
        </ul>
      </div>
      <label htmlFor="object">暗唱したい文</label>
      <input type="text" name="object" placeholder="暗唱したい文" />
      <button>作成</button>
      <button>カジュアルな文へ変身</button>
      <button>フォーマルな文へ変身</button>
      <label htmlFor="translation">訳</label>
      <input type="text" name="translation" placeholder="訳" />
    </>
  );
}
