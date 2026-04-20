export default function Flashcard() {
  const IsJapanese: boolean = false; // 日本語かどうかのフラグ

  return (
    <>
      IsJapanese ? (<h1>日本語の暗唱文がここに表示される</h1>) : (
      <h1>英語の暗唱文がここに表示される</h1>)
    </>
  );
}
