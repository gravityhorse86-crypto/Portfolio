"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { sentenceSchema } from "@/lib/flashcard-schemas";
import { removeRecordItem } from "@/lib/flashcard-labels";
import type {
  RewriteSuggestion,
  RewriteTone,
  SavedSentence,
  SentenceRow,
  SentenceRowErrors,
} from "@/types/flashcard";

type UseSentencesOptions = {
  selectedSetId: string;
  /** 保存・削除でカード数が変わったときにセット一覧を更新するためのコールバック。 */
  onSentencesChanged: (preferredSetId?: string) => Promise<void> | void;
};

const emptyRow: SentenceRow = { content: "", translation: "" };

export function useSentences({
  selectedSetId,
  onSentencesChanged,
}: UseSentencesOptions) {
  const router = useRouter();

  const [savedSentences, setSavedSentences] = useState<SavedSentence[]>([]);
  const [isLoadingSentences, setIsLoadingSentences] = useState(false);
  const [sentenceListMessage, setSentenceListMessage] = useState("");
  const [sentenceActionId, setSentenceActionId] = useState<string | null>(null);

  // 新規入力フォーム
  const [rows, setRows] = useState<SentenceRow[]>([{ ...emptyRow }]);
  const [rowErrors, setRowErrors] = useState<SentenceRowErrors[]>([{}]);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 既存カードの編集
  const [editingSentenceId, setEditingSentenceId] = useState<string | null>(
    null,
  );
  const [editingRow, setEditingRow] = useState<SentenceRow>({ ...emptyRow });
  const [editingErrors, setEditingErrors] = useState<SentenceRowErrors>({});

  // AI添削
  const [rewriteSuggestions, setRewriteSuggestions] = useState<
    Record<string, RewriteSuggestion>
  >({});
  const [rewriteErrors, setRewriteErrors] = useState<Record<string, string>>({});
  const [rewriteAction, setRewriteAction] = useState<{
    id: string;
    tone: RewriteTone;
  } | null>(null);

  const loadSentences = useCallback(
    async (setId: string) => {
      setIsLoadingSentences(true);

      try {
        const response = await fetch(
          `/api/sentences?setId=${encodeURIComponent(setId)}`,
        );
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            router.replace("/signin");
            return;
          }

          setMessage(data.message ?? "カード一覧の読み込みに失敗しました。");
          return;
        }

        setSavedSentences(Array.isArray(data.sentences) ? data.sentences : []);
      } catch {
        setMessage("カード一覧の読み込みに失敗しました。");
      } finally {
        setIsLoadingSentences(false);
      }
    },
    [router],
  );

  useEffect(() => {
    if (!selectedSetId) {
      setSavedSentences([]);
      return;
    }

    loadSentences(selectedSetId);
  }, [loadSentences, selectedSetId]);

  function addRow() {
    setRows((current) => [...current, { ...emptyRow }]);
    setRowErrors((current) => [...current, {}]);
  }

  function updateRow(index: number, key: keyof SentenceRow, value: string) {
    setRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row,
      ),
    );
    setRowErrors((current) =>
      current.map((error, rowIndex) =>
        rowIndex === index ? { ...error, [key]: undefined } : error,
      ),
    );
  }

  async function saveRows() {
    setMessage("");
    setRowErrors(rows.map(() => ({})));

    if (!selectedSetId) {
      setMessage("保存先のセットを選択してください。");
      return;
    }

    const sentences = rows.map((row) => ({
      content: row.content.trim(),
      translation: row.translation.trim(),
    }));

    const nextRowErrors = sentences.map<SentenceRowErrors>((row) => {
      if (row.content === "" && row.translation === "") {
        return {};
      }

      const result = sentenceSchema.safeParse(row);

      if (result.success) {
        return {};
      }

      const fieldErrors = result.error.flatten().fieldErrors;

      return {
        content: fieldErrors.content?.[0],
        translation: fieldErrors.translation?.[0],
      };
    });

    const completedSentences = sentences.filter((row, index) => {
      const rowError = nextRowErrors[index];

      return (
        row.content !== "" &&
        row.translation !== "" &&
        !rowError.content &&
        !rowError.translation
      );
    });

    const hasValidationError = nextRowErrors.some(
      (error) => error.content || error.translation,
    );

    if (hasValidationError) {
      setRowErrors(nextRowErrors);
      setMessage("入力内容を確認してください。");
      return;
    }

    if (completedSentences.length === 0) {
      setRowErrors(nextRowErrors);
      setMessage("保存する英文と日本語訳を入力してください。");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/sentences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setId: selectedSetId,
          sentences: completedSentences,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/signin");
          return;
        }

        setMessage(
          data.message ?? "保存に失敗しました。入力内容を確認してください。",
        );
        return;
      }

      setRows([{ ...emptyRow }]);
      setRowErrors([{}]);
      setMessage(`${data.count ?? completedSentences.length}件保存しました。`);
      await Promise.all([
        onSentencesChanged(selectedSetId),
        loadSentences(selectedSetId),
      ]);
    } catch {
      setMessage("通信に失敗しました。時間をおいてもう一度試してください。");
    } finally {
      setIsSaving(false);
    }
  }

  function startEditingSentence(sentence: SavedSentence) {
    setSentenceListMessage("");
    setEditingSentenceId(sentence.id);
    setEditingRow({
      content: sentence.content,
      translation: sentence.translation,
    });
    setEditingErrors({});
  }

  function cancelEditingSentence() {
    setEditingSentenceId(null);
    setEditingRow({ ...emptyRow });
    setEditingErrors({});
  }

  function updateEditingRow(key: keyof SentenceRow, value: string) {
    setEditingRow((current) => ({ ...current, [key]: value }));
    setEditingErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function saveSentenceEdit(sentenceId: string) {
    setSentenceListMessage("");

    const result = sentenceSchema.safeParse({
      content: editingRow.content.trim(),
      translation: editingRow.translation.trim(),
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setEditingErrors({
        content: fieldErrors.content?.[0],
        translation: fieldErrors.translation?.[0],
      });
      return;
    }

    setSentenceActionId(sentenceId);

    try {
      const response = await fetch(`/api/sentences/${sentenceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/signin");
          return;
        }

        if (data.fieldErrors) {
          setEditingErrors({
            content: data.fieldErrors.content?.[0],
            translation: data.fieldErrors.translation?.[0],
          });
        }

        setSentenceListMessage(data.message ?? "カードの更新に失敗しました。");
        return;
      }

      setSavedSentences((current) =>
        current.map((sentence) =>
          sentence.id === sentenceId
            ? {
                ...sentence,
                content: data.content ?? result.data.content,
                translation: data.translation ?? result.data.translation,
              }
            : sentence,
        ),
      );
      cancelEditingSentence();
      setSentenceListMessage("カードを更新しました。");
    } catch {
      setSentenceListMessage(
        "通信に失敗しました。時間をおいてもう一度試してください。",
      );
    } finally {
      setSentenceActionId(null);
    }
  }

  async function deleteSentence(sentenceId: string) {
    const shouldDelete = window.confirm("このフラッシュカードを削除しますか？");

    if (!shouldDelete) return;

    setSentenceListMessage("");
    setSentenceActionId(sentenceId);

    try {
      const response = await fetch(`/api/sentences/${sentenceId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/signin");
          return;
        }

        setSentenceListMessage(data.message ?? "カードの削除に失敗しました。");
        return;
      }

      if (editingSentenceId === sentenceId) {
        cancelEditingSentence();
      }

      setRewriteSuggestions((current) => removeRecordItem(current, sentenceId));
      setRewriteErrors((current) => removeRecordItem(current, sentenceId));
      setSavedSentences((current) =>
        current.filter((sentence) => sentence.id !== sentenceId),
      );
      setSentenceListMessage("カードを削除しました。");

      if (selectedSetId) {
        await onSentencesChanged(selectedSetId);
      }
    } catch {
      setSentenceListMessage(
        "通信に失敗しました。時間をおいてもう一度試してください。",
      );
    } finally {
      setSentenceActionId(null);
    }
  }

  async function requestSentenceRewrite(sentenceId: string, tone: RewriteTone) {
    setRewriteErrors((current) => removeRecordItem(current, sentenceId));
    setRewriteAction({ id: sentenceId, tone });

    try {
      const response = await fetch(`/api/sentences/${sentenceId}/rewrite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tone }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/signin");
          return;
        }

        setRewriteErrors((current) => ({
          ...current,
          [sentenceId]: data.message ?? "AI添削に失敗しました。",
        }));
        return;
      }

      setRewriteSuggestions((current) => ({
        ...current,
        [sentenceId]: {
          tone,
          text: data.suggestion,
        },
      }));
    } catch {
      setRewriteErrors((current) => ({
        ...current,
        [sentenceId]: "通信に失敗しました。時間をおいてもう一度試してください。",
      }));
    } finally {
      setRewriteAction(null);
    }
  }

  function cancelRewriteSuggestion(sentenceId: string) {
    setRewriteSuggestions((current) => removeRecordItem(current, sentenceId));
    setRewriteErrors((current) => removeRecordItem(current, sentenceId));
  }

  async function applyRewriteSuggestion(sentenceId: string) {
    const suggestion = rewriteSuggestions[sentenceId];

    if (!suggestion) return;

    setSentenceActionId(sentenceId);
    setRewriteErrors((current) => removeRecordItem(current, sentenceId));

    try {
      const response = await fetch(`/api/sentences/${sentenceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: suggestion.text }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/signin");
          return;
        }

        setRewriteErrors((current) => ({
          ...current,
          [sentenceId]: data.message ?? "カードの更新に失敗しました。",
        }));
        return;
      }

      setSavedSentences((current) =>
        current.map((sentence) =>
          sentence.id === sentenceId
            ? {
                ...sentence,
                content: data.content ?? suggestion.text,
                translation: data.translation ?? sentence.translation,
              }
            : sentence,
        ),
      );
      cancelRewriteSuggestion(sentenceId);
      setSentenceListMessage("AI添削文に変更しました。");
    } catch {
      setRewriteErrors((current) => ({
        ...current,
        [sentenceId]: "通信に失敗しました。時間をおいてもう一度試してください。",
      }));
    } finally {
      setSentenceActionId(null);
    }
  }

  return {
    // 一覧
    savedSentences,
    isLoadingSentences,
    sentenceListMessage,
    sentenceActionId,
    // 新規入力
    rows,
    rowErrors,
    message,
    isSaving,
    addRow,
    updateRow,
    saveRows,
    // 編集
    editingSentenceId,
    editingRow,
    editingErrors,
    startEditingSentence,
    cancelEditingSentence,
    updateEditingRow,
    saveSentenceEdit,
    // 削除
    deleteSentence,
    // AI添削
    rewriteSuggestions,
    rewriteErrors,
    rewriteAction,
    requestSentenceRewrite,
    cancelRewriteSuggestion,
    applyRewriteSuggestion,
  };
}
