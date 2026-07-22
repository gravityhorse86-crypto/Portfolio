"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SentenceCard = {
  id: string;
  content: string;
  translation: string;
};

type FlashcardClientProps = {
  sentences: SentenceCard[];
};

type StatusValue = "0" | "1" | "2";

const statusButtons: { label: string; value: StatusValue; className: string }[] =
  [
    {
      label: "覚えてない",
      value: "2",
      className: "bg-rose-500 hover:bg-rose-600",
    },
    {
      label: "怪しい",
      value: "1",
      className: "bg-amber-500 hover:bg-amber-600",
    },
    {
      label: "覚えた",
      value: "0",
      className: "bg-emerald-500 hover:bg-emerald-600",
    },
  ];

export function FlashcardClient({ sentences }: FlashcardClientProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const currentSentence = sentences[currentIndex];
  const isFinished = sentences.length > 0 && currentIndex >= sentences.length;

  const flipCard = useCallback(() => {
    if (!currentSentence) return;
    setIsFlipped((current) => !current);
  }, [currentSentence]);

  const goToMypage = useCallback(() => {
    router.push("/mypage");
  }, [router]);

  const updateStatus = useCallback(
    async (statusValue: StatusValue) => {
      if (!currentSentence || isUpdating) return;

      setIsUpdating(true);
      setErrorMessage("");

      try {
        const response = await fetch(`/api/sentences/${currentSentence.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status_id: statusValue }),
        });

        if (!response.ok) {
          setErrorMessage("ステータスの更新に失敗しました。");
          return;
        }

        // Supabaseへの登録が成功した瞬間に次のカードへ進む（戻れない）
        setIsFlipped(false);
        setCurrentIndex((current) => current + 1);
      } catch {
        setErrorMessage("通信に失敗しました。");
      } finally {
        setIsUpdating(false);
      }
    },
    [currentSentence, isUpdating],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        flipCard();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [flipCard]);

  if (sentences.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-800">
            まだカードがありません
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            マイページで英文と日本語訳を登録すると、ここに表示されます。
          </p>
          <button
            type="button"
            onClick={goToMypage}
            className="mt-6 rounded-lg bg-sky-500 px-5 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-sky-600"
          >
            マイページへ戻る
          </button>
        </div>
      </main>
    );
  }

  if (isFinished) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-800">お疲れさまでした！</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            {sentences.length}枚のカードをすべて確認しました。
          </p>
          <button
            type="button"
            onClick={goToMypage}
            className="mt-6 rounded-lg bg-sky-500 px-5 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-sky-600"
          >
            マイページへ戻る
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-xl">
        <div className="mb-4 flex items-center justify-between gap-3 text-sm text-slate-500">
          <p>
            {currentIndex + 1} / {sentences.length}
          </p>
          <button
            type="button"
            onClick={goToMypage}
            className="rounded-lg bg-red-500 px-4 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-red-600"
          >
            キャンセル
          </button>
        </div>

        <p className="mb-2 text-center text-sm text-slate-500">
          {isFlipped ? "日本語訳" : "英文"}
        </p>

        <button
          type="button"
          onClick={flipCard}
          className="group h-80 w-full [perspective:1000px]"
          aria-label="フラッシュカードを裏返す"
        >
          <div
            className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${
              isFlipped ? "[transform:rotateY(180deg)]" : ""
            }`}
          >
            <section className="absolute inset-0 flex items-center justify-center rounded-lg bg-white p-8 text-center shadow-lg [backface-visibility:hidden]">
              <p className="text-2xl font-semibold leading-relaxed text-slate-800">
                {currentSentence.content}
              </p>
            </section>

            <section className="absolute inset-0 flex items-center justify-center rounded-lg bg-indigo-600 p-8 text-center shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <p className="text-2xl font-semibold leading-relaxed text-white">
                {currentSentence.translation}
              </p>
            </section>
          </div>
        </button>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {statusButtons.map((button) => (
            <button
              key={button.value}
              type="button"
              onClick={() => updateStatus(button.value)}
              disabled={isUpdating}
              className={`rounded-lg px-4 py-3 font-semibold text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${button.className}`}
            >
              {button.label}
            </button>
          ))}
        </div>

        {errorMessage && (
          <p className="mt-3 text-center text-sm text-red-500">{errorMessage}</p>
        )}
      </div>
    </main>
  );
}
