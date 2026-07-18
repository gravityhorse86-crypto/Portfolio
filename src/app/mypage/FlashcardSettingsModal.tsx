"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type FlashcardSettingsModalProps = {
  onClose: () => void;
};

type FlashcardSetOption = {
  id: string;
  name: string;
  sentenceCount: number;
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
  const [sets, setSets] = useState<FlashcardSetOption[]>([]);
  const [selectedSetId, setSelectedSetId] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [isLoadingSets, setIsLoadingSets] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [setMessage, setSetMessage] = useState("");

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

  useEffect(() => {
    let ignore = false;

    async function loadSets() {
      try {
        const response = await fetch("/api/flashcard-sets");
        const data = await response.json();

        if (ignore) return;

        if (!response.ok) {
          setSetMessage(data.message ?? "セットの読み込みに失敗しました。");
          return;
        }

        const nextSets = Array.isArray(data.sets) ? data.sets : [];
        setSets(nextSets);
        setSelectedSetId((current) => current || nextSets[0]?.id || "");
      } catch {
        if (!ignore) {
          setSetMessage("セットの読み込みに失敗しました。");
        }
      } finally {
        if (!ignore) {
          setIsLoadingSets(false);
        }
      }
    }

    loadSets();

    return () => {
      ignore = true;
    };
  }, []);

  function getFlashcardHref() {
    const params = new URLSearchParams();

    if (selectedSetId) {
      params.set("setId", selectedSetId);
    }

    if (status !== "all") {
      params.set("status", status);
    }

    params.set("sort", sort);

    return `/flashcard?${params.toString()}`;
  }

  const selectedSet = sets.find((set) => set.id === selectedSetId);
  const canStart = !isLoadingSets && Boolean(selectedSetId) && !isStarting;

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
          <label
            htmlFor="flashcard-set"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            セット
          </label>
          <select
            id="flashcard-set"
            value={selectedSetId}
            onChange={(event) => setSelectedSetId(event.target.value)}
            disabled={isLoadingSets}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="" disabled>
              {isLoadingSets ? "読み込み中..." : "セットがありません"}
            </option>
            {sets.map((set) => (
              <option key={set.id} value={set.id}>
                {set.name}（{set.sentenceCount}件）
              </option>
            ))}
          </select>
          {selectedSet && (
            <p className="mt-2 text-xs text-slate-500">
              このセットのカード数：{selectedSet.sentenceCount}件
            </p>
          )}
          {setMessage && (
            <p className="mt-2 text-sm text-red-500">{setMessage}</p>
          )}
        </div>

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
                    ? "border-sky-500 bg-sky-500 text-white"
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
            disabled={isStarting}
            className="rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            キャンセル
          </button>
          <Link
            href={getFlashcardHref()}
            onClick={(event) => {
              if (!canStart) {
                event.preventDefault();
                return;
              }

              setIsStarting(true);
            }}
            className="rounded-lg bg-sky-500 px-4 py-3 text-center font-semibold text-white transition-colors hover:bg-sky-600 aria-disabled:pointer-events-none aria-disabled:bg-sky-300"
            aria-disabled={!canStart}
          >
            {isStarting ? "読み込み中..." : "スタート"}
          </Link>
        </div>
      </div>
    </div>
  );
}
