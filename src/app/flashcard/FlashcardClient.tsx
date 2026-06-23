"use client";

import { useCallback, useEffect, useState } from "react";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<StatusValue | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const currentSentence = sentences[currentIndex];

  const flipCard = useCallback(() => {
    if (!currentSentence) return;
    setIsFlipped((current) => !current);
  }, [currentSentence]);

  const moveCard = useCallback(
    (direction: "prev" | "next") => {
      if (sentences.length === 0) return;

      setIsFlipped(false);
      setStatusMessage("");
      setCurrentIndex((current) => {
        if (direction === "prev") {
          return current === 0 ? sentences.length - 1 : current - 1;
        }

        return current === sentences.length - 1 ? 0 : current + 1;
      });
    },
    [sentences.length],
  );

  const updateStatus = useCallback(
    async (statusValue: StatusValue) => {
      if (!currentSentence || updatingStatus) return;

      setUpdatingStatus(statusValue);
      setStatusMessage("");

      try {
        const response = await fetch(`/api/sentences/${currentSentence.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status_id: statusValue }),
        });

        if (!response.ok) {
          setStatusMessage("ステータスの更新に失敗しました。");
          return;
        }

        setStatusMessage("ステータスを更新しました。");
      } catch {
        setStatusMessage("通信に失敗しました。");
      } finally {
        setUpdatingStatus(null);
      }
    },
    [currentSentence, updatingStatus],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        flipCard();
      }

      if (event.code === "ArrowLeft") {
        moveCard("prev");
      }

      if (event.code === "ArrowRight") {
        moveCard("next");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [flipCard, moveCard]);

  if (!currentSentence) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-800">
            まだカードがありません
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            マイページで英文と日本語訳を登録すると、ここに表示されます。
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-xl">
        <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
          <p>
            {currentIndex + 1} / {sentences.length}
          </p>
          <p>{isFlipped ? "日本語訳" : "英文"}</p>
        </div>

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
              disabled={updatingStatus !== null}
              className={`rounded-lg px-4 py-3 font-semibold text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${button.className}`}
            >
              {button.label}
            </button>
          ))}
        </div>

        {statusMessage && (
          <p className="mt-3 text-center text-sm text-slate-500">
            {statusMessage}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => moveCard("prev")}
            className="rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-100"
          >
            前へ
          </button>
          <button
            type="button"
            onClick={() => moveCard("next")}
            className="rounded-lg bg-sky-500 px-4 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-sky-600"
          >
            次へ
          </button>
        </div>
      </div>
    </main>
  );
}
