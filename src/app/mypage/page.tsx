"use client";

import { useState } from "react";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useFlashcardSets } from "@/hooks/useFlashcardSets";
import { useSentences } from "@/hooks/useSentences";

import { FlashcardSettingsModal } from "./FlashcardSettingsModal";
import { MyPageHeader } from "./components/MyPageHeader";
import { FlashcardSetControls } from "./components/FlashcardSetControls";
import { SentenceComposer } from "./components/SentenceComposer";
import { SavedSentenceList } from "./components/SavedSentenceList";
import { ConfirmModal } from "./components/ConfirmModal";

export default function MyPage() {
  const { user, stats, isCheckingAuth, logout } = useAuthGuard();
  const flashcardSets = useFlashcardSets(Boolean(user));
  const sentences = useSentences({
    selectedSetId: flashcardSets.selectedSetId,
    onSentencesChanged: flashcardSets.loadSets,
  });
  const [isFlashcardSettingsOpen, setIsFlashcardSettingsOpen] = useState(false);
  const [isDeleteSetModalOpen, setIsDeleteSetModalOpen] = useState(false);

  if (isCheckingAuth || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-300 p-6">
        <p className="cursor-default select-none text-sm text-white/80">
          読み込み中...
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        className="min-h-screen bg-sky-300 p-4 md:p-8"
        aria-hidden={isFlashcardSettingsOpen || isDeleteSetModalOpen}
        inert={
          isFlashcardSettingsOpen || isDeleteSetModalOpen ? true : undefined
        }
      >
        <div className="mx-auto w-full max-w-md md:max-w-5xl">
          <MyPageHeader
            username={user.username}
            stats={stats}
            onLogout={logout}
          />

          <div className="mb-6 flex justify-center">
            <button
              type="button"
              onClick={() => setIsFlashcardSettingsOpen(true)}
              className="rounded-xl bg-white px-10 py-4 text-lg font-bold text-sky-700 shadow-md transition-colors hover:bg-sky-50"
            >
              フラッシュカードへ
            </button>
          </div>

          <div className="rounded-lg border border-sky-100 bg-white p-5 shadow-sm">
            <FlashcardSetControls
              sets={flashcardSets.sets}
              selectedSetId={flashcardSets.selectedSetId}
              onSelectSet={flashcardSets.setSelectedSetId}
              isLoadingSets={flashcardSets.isLoadingSets}
              newSetName={flashcardSets.newSetName}
              onChangeNewSetName={(value) => {
                flashcardSets.setNewSetName(value);
                flashcardSets.setSetErrors({});
              }}
              onCreateSet={flashcardSets.createSet}
              isCreatingSet={flashcardSets.isCreatingSet}
              setErrors={flashcardSets.setErrors}
              message={flashcardSets.message}
            />

            <div className="grid gap-6 pt-5 md:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
              <SentenceComposer
                rows={sentences.rows}
                rowErrors={sentences.rowErrors}
                onAddRow={sentences.addRow}
                onUpdateRow={sentences.updateRow}
                onSave={sentences.saveRows}
                isSaving={sentences.isSaving}
                canSave={Boolean(flashcardSets.selectedSetId)}
                message={sentences.message}
              />

              <SavedSentenceList
                selectedSetId={flashcardSets.selectedSetId}
                selectedSetName={flashcardSets.selectedSet?.name}
                onRenameSet={(name) =>
                  flashcardSets.renameSet(flashcardSets.selectedSetId, name)
                }
                onRequestDeleteSet={() => setIsDeleteSetModalOpen(true)}
                sentences={sentences}
              />
            </div>
          </div>
        </div>
      </div>

      {isFlashcardSettingsOpen && (
        <FlashcardSettingsModal
          onClose={() => setIsFlashcardSettingsOpen(false)}
        />
      )}

      {isDeleteSetModalOpen && (
        <ConfirmModal
          message="セットを削除すると、登録された文章も削除されますがよろしいですか？"
          confirmLabel="OK"
          cancelLabel="キャンセル"
          onCancel={() => setIsDeleteSetModalOpen(false)}
          onConfirm={() => {
            const targetSetId = flashcardSets.selectedSetId;
            setIsDeleteSetModalOpen(false);

            if (targetSetId) {
              flashcardSets.deleteSet(targetSetId);
            }
          }}
        />
      )}
    </>
  );
}
