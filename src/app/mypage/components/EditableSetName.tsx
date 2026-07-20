"use client";

import { useEffect, useRef, useState } from "react";

type EditableSetNameProps = {
  name: string;
  /** ブラー（フォーカスが外れた）時に呼ばれる。変更がなければ何もしない側で判定。 */
  onRename: (name: string) => void;
};

/**
 * セット名をダブルクリックするとインライン編集でき、
 * フォーカスが外れる（＝どこかをクリックする）と自動保存する。
 */
export function EditableSetName({ name, onRename }: EditableSetNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  function startEditing() {
    setDraft(name);
    setIsEditing(true);
  }

  function commit() {
    setIsEditing(false);
    onRename(draft);
  }

  function cancel() {
    setDraft(name);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        maxLength={30}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            inputRef.current?.blur();
          }

          if (event.key === "Escape") {
            event.preventDefault();
            cancel();
          }
        }}
        className="min-w-0 flex-1 rounded-md border border-sky-300 bg-white px-2 py-1 text-base font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-sky-100"
        aria-label="セット名を編集"
      />
    );
  }

  return (
    <h2
      onDoubleClick={startEditing}
      title="ダブルクリックで名前を変更"
      className="min-w-0 flex-1 cursor-text truncate text-base font-bold text-slate-800"
    >
      {name}
    </h2>
  );
}
