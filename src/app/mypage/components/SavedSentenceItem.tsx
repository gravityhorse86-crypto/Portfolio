import { rewriteToneLabels, statusLabels } from "@/lib/flashcard-labels";
import type {
  RewriteSuggestion,
  RewriteTone,
  SavedSentence,
  SentenceRow,
  SentenceRowErrors,
} from "@/types/flashcard";

type SavedSentenceItemProps = {
  sentence: SavedSentence;
  isBusy: boolean;
  // 編集
  isEditing: boolean;
  editingRow: SentenceRow;
  editingErrors: SentenceRowErrors;
  onUpdateEditingRow: (key: keyof SentenceRow, value: string) => void;
  onSaveEdit: (sentenceId: string) => void;
  onCancelEdit: () => void;
  onStartEditing: (sentence: SavedSentence) => void;
  onDelete: (sentenceId: string) => void;
  // AI添削
  rewriteSuggestion?: RewriteSuggestion;
  rewriteError?: string;
  /** いずれかのカードでAI添削生成中か（全ボタンの無効化に使う）。 */
  isAnyRewriting: boolean;
  /** このカードで生成中のトーン。生成中でなければ null。 */
  rewritingTone: RewriteTone | null;
  onRequestRewrite: (sentenceId: string, tone: RewriteTone) => void;
  onCancelRewrite: (sentenceId: string) => void;
  onApplyRewrite: (sentenceId: string) => void;
};

export function SavedSentenceItem({
  sentence,
  isBusy,
  isEditing,
  editingRow,
  editingErrors,
  onUpdateEditingRow,
  onSaveEdit,
  onCancelEdit,
  onStartEditing,
  onDelete,
  rewriteSuggestion,
  rewriteError,
  isAnyRewriting,
  rewritingTone,
  onRequestRewrite,
  onCancelRewrite,
  onApplyRewrite,
}: SavedSentenceItemProps) {
  return (
    <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              英文
            </label>
            <textarea
              value={editingRow.content}
              onChange={(event) =>
                onUpdateEditingRow("content", event.target.value)
              }
              className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-900 focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100"
            />
            {editingErrors.content && (
              <p className="mt-1 text-sm text-red-500">{editingErrors.content}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              日本語訳
            </label>
            <textarea
              value={editingRow.translation}
              onChange={(event) =>
                onUpdateEditingRow("translation", event.target.value)
              }
              maxLength={200}
              className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-900 focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100"
            />
            {editingErrors.translation && (
              <p className="mt-1 text-sm text-red-500">
                {editingErrors.translation}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onSaveEdit(sentence.id)}
              disabled={isBusy}
              className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isBusy ? "保存中..." : "保存"}
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={isBusy}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm font-semibold leading-6 text-slate-800">
            {sentence.content}
          </p>

          {rewriteSuggestion && (
            <div className="mt-2 rounded-lg border border-sky-100 bg-white p-3">
              <p className="text-xs font-bold text-sky-600">
                AI添削：{rewriteToneLabels[rewriteSuggestion.tone]}
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">
                {rewriteSuggestion.text}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onApplyRewrite(sentence.id)}
                  disabled={isBusy}
                  className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isBusy ? "変更中..." : "変更する"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onRequestRewrite(sentence.id, rewriteSuggestion.tone)
                  }
                  disabled={isAnyRewriting}
                  className="rounded-lg border border-sky-100 bg-white px-3 py-1.5 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {rewritingTone !== null ? "生成中..." : "もう一回"}
                </button>
                <button
                  type="button"
                  onClick={() => onCancelRewrite(sentence.id)}
                  disabled={isBusy}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}

          {rewriteError && (
            <p className="mt-2 text-sm text-red-500">{rewriteError}</p>
          )}

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {sentence.translation}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold text-sky-600">
              {statusLabels[sentence.status_id]}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onRequestRewrite(sentence.id, "casual")}
                disabled={isAnyRewriting}
                className="rounded-lg border border-emerald-100 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {rewritingTone === "casual" ? "生成中..." : "カジュアルに"}
              </button>
              <button
                type="button"
                onClick={() => onRequestRewrite(sentence.id, "formal")}
                disabled={isAnyRewriting}
                className="rounded-lg border border-indigo-100 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {rewritingTone === "formal" ? "生成中..." : "フォーマルに"}
              </button>
              <button
                type="button"
                onClick={() => onStartEditing(sentence)}
                disabled={isBusy}
                className="rounded-lg border border-sky-100 bg-white px-3 py-1.5 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                編集
              </button>
              <button
                type="button"
                onClick={() => onDelete(sentence.id)}
                disabled={isBusy}
                className="rounded-lg border border-red-100 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isBusy ? "処理中..." : "削除"}
              </button>
            </div>
          </div>
        </>
      )}
    </li>
  );
}
