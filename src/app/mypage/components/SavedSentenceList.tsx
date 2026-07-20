import type { useSentences } from "@/hooks/useSentences";

import { EditableSetName } from "./EditableSetName";
import { SavedSentenceItem } from "./SavedSentenceItem";

type SavedSentenceListProps = {
  selectedSetId: string;
  selectedSetName?: string;
  onRenameSet: (name: string) => void;
  onRequestDeleteSet: () => void;
  sentences: ReturnType<typeof useSentences>;
};

export function SavedSentenceList({
  selectedSetId,
  selectedSetName,
  onRenameSet,
  onRequestDeleteSet,
  sentences,
}: SavedSentenceListProps) {
  const {
    savedSentences,
    isLoadingSentences,
    sentenceListMessage,
    sentenceActionId,
    editingSentenceId,
    editingRow,
    editingErrors,
    startEditingSentence,
    cancelEditingSentence,
    updateEditingRow,
    saveSentenceEdit,
    deleteSentence,
    rewriteSuggestions,
    rewriteErrors,
    rewriteAction,
    requestSentenceRewrite,
    cancelRewriteSuggestion,
    applyRewriteSuggestion,
  } = sentences;

  return (
    <section className="border-t border-slate-100 pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0">
      <div className="mb-4 flex items-center gap-3">
        {selectedSetId ? (
          <EditableSetName
            name={selectedSetName ?? "選択中セット"}
            onRename={onRenameSet}
          />
        ) : (
          <h2 className="min-w-0 flex-1 truncate text-base font-bold text-slate-800">
            選択中セット
          </h2>
        )}
        <p className="shrink-0 text-sm font-semibold text-sky-600">
          {savedSentences.length}件
        </p>
        {selectedSetId && (
          <button
            type="button"
            onClick={onRequestDeleteSet}
            className="shrink-0 rounded-lg border border-red-100 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            セット削除
          </button>
        )}
      </div>

      {sentenceListMessage && (
        <p className="mb-3 text-sm text-slate-600">{sentenceListMessage}</p>
      )}

      {isLoadingSentences ? (
        <p className="text-sm text-slate-500">読み込み中...</p>
      ) : savedSentences.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-sm leading-6 text-slate-500">
          このセットにはまだカードがありません。
        </p>
      ) : (
        <ul className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
          {savedSentences.map((sentence) => (
            <SavedSentenceItem
              key={sentence.id}
              sentence={sentence}
              isBusy={sentenceActionId === sentence.id}
              isEditing={editingSentenceId === sentence.id}
              editingRow={editingRow}
              editingErrors={editingErrors}
              onUpdateEditingRow={updateEditingRow}
              onSaveEdit={saveSentenceEdit}
              onCancelEdit={cancelEditingSentence}
              onStartEditing={startEditingSentence}
              onDelete={deleteSentence}
              rewriteSuggestion={rewriteSuggestions[sentence.id]}
              rewriteError={rewriteErrors[sentence.id]}
              isAnyRewriting={Boolean(rewriteAction)}
              rewritingTone={
                rewriteAction?.id === sentence.id ? rewriteAction.tone : null
              }
              onRequestRewrite={requestSentenceRewrite}
              onCancelRewrite={cancelRewriteSuggestion}
              onApplyRewrite={applyRewriteSuggestion}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
