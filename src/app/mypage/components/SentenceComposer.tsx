import type { SentenceRow, SentenceRowErrors } from "@/types/flashcard";

type SentenceComposerProps = {
  rows: SentenceRow[];
  rowErrors: SentenceRowErrors[];
  onAddRow: () => void;
  onUpdateRow: (index: number, key: keyof SentenceRow, value: string) => void;
  onSave: () => void;
  isSaving: boolean;
  canSave: boolean;
  message: string;
};

export function SentenceComposer({
  rows,
  rowErrors,
  onAddRow,
  onUpdateRow,
  onSave,
  isSaving,
  canSave,
  message,
}: SentenceComposerProps) {
  return (
    <section>
      <h2 className="mb-4 text-base font-bold text-slate-800">文章入力</h2>

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
                onChange={(event) =>
                  onUpdateRow(index, "content", event.target.value)
                }
                placeholder="例: I've been looking forward to meeting you."
                className="min-h-24 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
              />
              {rowErrors[index]?.content && (
                <p className="mt-1 text-sm text-red-500">
                  {rowErrors[index]?.content}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                日本語訳
              </label>
              <textarea
                value={row.translation}
                onChange={(event) =>
                  onUpdateRow(index, "translation", event.target.value)
                }
                placeholder="例: お会いできるのを楽しみにしていました。"
                maxLength={200}
                className="min-h-24 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
              />
              {rowErrors[index]?.translation && (
                <p className="mt-1 text-sm text-red-500">
                  {rowErrors[index]?.translation}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onAddRow}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-100"
        >
          ＋
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || !canSave}
          className="rounded-lg bg-sky-500 px-5 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSaving ? "保存中..." : "保存"}
        </button>
      </div>
    </section>
  );
}
