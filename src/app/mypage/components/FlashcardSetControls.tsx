import type { FlashcardSet, SetFieldErrors } from "@/types/flashcard";

type FlashcardSetControlsProps = {
  sets: FlashcardSet[];
  selectedSetId: string;
  onSelectSet: (setId: string) => void;
  isLoadingSets: boolean;
  newSetName: string;
  onChangeNewSetName: (value: string) => void;
  onCreateSet: () => void;
  isCreatingSet: boolean;
  setErrors: SetFieldErrors;
  message: string;
};

export function FlashcardSetControls({
  sets,
  selectedSetId,
  onSelectSet,
  isLoadingSets,
  newSetName,
  onChangeNewSetName,
  onCreateSet,
  isCreatingSet,
  setErrors,
  message,
}: FlashcardSetControlsProps) {
  return (
    <div className="border-b border-slate-100 pb-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="save-set"
            className="mb-1 block text-sm font-semibold text-slate-700"
          >
            保存先セット
          </label>
          <select
            id="save-set"
            value={selectedSetId}
            onChange={(event) => onSelectSet(event.target.value)}
            disabled={isLoadingSets}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-800 transition-colors focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100"
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
        </div>

        <div>
          <label
            htmlFor="new-set-name"
            className="mb-1 block text-sm font-semibold text-slate-700"
          >
            新しいセット
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="new-set-name"
              type="text"
              value={newSetName}
              onChange={(event) => onChangeNewSetName(event.target.value)}
              placeholder="例: 旅行英会話"
              className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
            />
            <button
              type="button"
              onClick={onCreateSet}
              disabled={isCreatingSet}
              className="rounded-lg bg-sky-500 px-4 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isCreatingSet ? "作成中..." : "セット作成"}
            </button>
          </div>
          {setErrors.name?.[0] && (
            <p className="mt-1 text-sm text-red-500">{setErrors.name[0]}</p>
          )}
        </div>
      </div>

      {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
    </div>
  );
}
