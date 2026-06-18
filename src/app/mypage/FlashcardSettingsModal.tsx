"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type FlashcardSettingsModalProps = {
  onClose: () => void;
};

type StatusFilter = "all" | "2" | "1" | "0";
type SortOrder = "newest" | "oldest";

const statusOptions: { label: string; value: StatusFilter }[] = [
  { label: "すべて", value: "all" },
  { label: "覚えてない", value: "2" },
  { label: "怪しい", value: "1" },
  { label: "覚えた", value: "0" },
];

const sortOptions: { label: string; value: SortOrder }[] = [
  { label: "新しい順", value: "newest" },
  { label: "古い順", value: "oldest" },
];

export function FlashcardSettingsModal({
  onClose,
}: FlashcardSettingsModalProps) {
  const router = useRouter();
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortOrder>("newest");

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  function startFlashcard() {
    const params = new URLSearchParams();

    if (status !== "all") {
      params.set("status", status);
    }

    params.set("sort", sort);

    router.push(`/flashcard?${params.toString()}`);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="flashcard-settings-title"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2
          id="flashcard-settings-title"
          className="text-xl font-bold text-slate-800"
        >
          フラッシュカード設定
        </h2>

        <div className="mt-6">
          <p className="mb-2 text-sm font-semibold text-slate-700">
            フィルター
          </p>
          <div className="grid grid-cols-2 gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatus(option.value)}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                  status === option.value
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-sm font-semibold text-slate-700">ソート</p>
          <div className="grid grid-cols-2 gap-2">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSort(option.value)}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                  sort === option.value
                    ? "border-sky-500 bg-sky-500 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={startFlashcard}
            className="rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            スタート
          </button>
        </div>
      </div>
    </div>
  );
}
