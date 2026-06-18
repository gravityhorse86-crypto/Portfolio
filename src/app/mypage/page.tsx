"use client";

import { useState } from "react";

import { FlashcardSettingsModal } from "./FlashcardSettingsModal";

type SentenceRow = {
  content: string;
  translation: string;
};

export default function MyPage() {
  const [rows, setRows] = useState<SentenceRow[]>([
    { content: "", translation: "" },
  ]);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isFlashcardSettingsOpen, setIsFlashcardSettingsOpen] =
    useState(false);

  function addRow() {
    setRows([...rows, { content: "", translation: "" }]);
  }

  function updateRow(
    index: number,
    key: "content" | "translation",
    value: string,
  ) {
    setRows(
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row,
      ),
    );
  }

  async function saveRows() {
    setMessage("");

    const sentences = rows
      .map((row) => ({
        content: row.content.trim(),
        translation: row.translation.trim(),
      }))
      .filter((row) => row.content !== "" || row.translation !== "");

    if (sentences.length === 0) {
      setMessage("保存する英文と日本語訳を入力してください。");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/sentences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sentences }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message ?? "保存に失敗しました。入力内容を確認してください。");
        return;
      }

      setRows([{ content: "", translation: "" }]);
      setMessage(`${data.count ?? sentences.length}件保存しました。`);
    } catch {
      setMessage("通信に失敗しました。時間をおいてもう一度試してください。");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
    <div
      className="min-h-screen bg-slate-50 p-4 md:p-8"
      aria-hidden={isFlashcardSettingsOpen}
      inert={isFlashcardSettingsOpen ? true : undefined}
    >
      <div className="mx-auto w-full max-w-md md:max-w-2xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">マイページ</h1>
            <p className="mt-4 text-slate-600">1ヶ月以内に暗唱した数：</p>
            <p className="text-slate-600">これまでに暗唱した数：</p>
          </div>

          <button
            type="button"
            onClick={() => setIsFlashcardSettingsOpen(true)}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            フラッシュカードへ
          </button>
        </div>

        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4">
            {rows.map((row, index) => (
              <div
                key={index}
                className="grid gap-3 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0 md:grid-cols-2"
              >
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    英文
                  </label>
                  <textarea
                    value={row.content}
                    onChange={(e) => updateRow(index, "content", e.target.value)}
                    placeholder="例: I've been looking forward to meeting you."
                    className="min-h-24 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    日本語訳
                  </label>
                  <textarea
                    value={row.translation}
                    onChange={(e) =>
                      updateRow(index, "translation", e.target.value)
                    }
                    placeholder="例: お会いできるのを楽しみにしていました。"
                    maxLength={200}
                    className="min-h-24 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
                  />
                </div>
              </div>
            ))}
          </div>

          {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={addRow}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-100"
            >
              ＋
            </button>
            <button
              type="button"
              onClick={saveRows}
              disabled={isSaving}
              className="rounded-lg bg-sky-500 px-5 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSaving ? "保存中..." : "保存"}
            </button>
          </div>
        </div>
      </div>

    </div>

    {isFlashcardSettingsOpen && (
      <FlashcardSettingsModal
        onClose={() => setIsFlashcardSettingsOpen(false)}
      />
    )}
    </>
  );
}
