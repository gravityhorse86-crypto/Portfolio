"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { FlashcardSettingsModal } from "./FlashcardSettingsModal";
import { CharacterStatus } from "./CharacterStatus";

type SentenceRow = {
  content: string;
  translation: string;
};

type UserInfo = {
  id: string;
  username: string;
  email: string;
};

type StudyStats = {
  monthlyCount: number;
  totalCount: number;
};

type FlashcardSet = {
  id: string;
  name: string;
  sentenceCount: number;
};

type SavedSentence = {
  id: string;
  content: string;
  translation: string;
  status_id: "0" | "1" | "2";
  created_at: string;
};

type RewriteTone = "casual" | "formal";

type RewriteSuggestion = {
  tone: RewriteTone;
  text: string;
};

type SentenceRowErrors = Partial<Record<keyof SentenceRow, string>>;
type SetFieldErrors = Partial<Record<"name", string[]>>;

const sentenceSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "英文を入力してください")
    .refine((value) => value.trim().split(/\s+/).length <= 100, {
      message: "英文は100語以内で入力してください",
    }),
  translation: z
    .string()
    .trim()
    .min(1, "日本語訳を入力してください")
    .max(200, "日本語訳は200文字以内で入力してください"),
});

const setSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "セット名を入力してください")
    .max(30, "セット名は30文字以内で入力してください"),
});

const statusLabels: Record<SavedSentence["status_id"], string> = {
  "0": "覚えた",
  "1": "怪しい",
  "2": "覚えてない",
};

const rewriteToneLabels: Record<RewriteTone, string> = {
  casual: "カジュアル",
  formal: "フォーマル",
};

function removeRecordItem<T>(record: Record<string, T>, key: string) {
  const nextRecord = { ...record };
  delete nextRecord[key];
  return nextRecord;
}

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [stats, setStats] = useState<StudyStats>({
    monthlyCount: 0,
    totalCount: 0,
  });
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [rows, setRows] = useState<SentenceRow[]>([
    { content: "", translation: "" },
  ]);
  const [rowErrors, setRowErrors] = useState<SentenceRowErrors[]>([{}]);
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [selectedSetId, setSelectedSetId] = useState("");
  const [savedSentences, setSavedSentences] = useState<SavedSentence[]>([]);
  const [editingSentenceId, setEditingSentenceId] = useState<string | null>(
    null,
  );
  const [editingRow, setEditingRow] = useState<SentenceRow>({
    content: "",
    translation: "",
  });
  const [editingErrors, setEditingErrors] = useState<SentenceRowErrors>({});
  const [sentenceActionId, setSentenceActionId] = useState<string | null>(null);
  const [rewriteSuggestions, setRewriteSuggestions] = useState<
    Record<string, RewriteSuggestion>
  >({});
  const [rewriteErrors, setRewriteErrors] = useState<Record<string, string>>({});
  const [rewriteAction, setRewriteAction] = useState<{
    id: string;
    tone: RewriteTone;
  } | null>(null);
  const [newSetName, setNewSetName] = useState("");
  const [setErrors, setSetErrors] = useState<SetFieldErrors>({});
  const [flashcardSetMessage, setSetMessage] = useState("");
  const [message, setMessage] = useState("");
  const [sentenceListMessage, setSentenceListMessage] = useState("");
  const [isLoadingSets, setIsLoadingSets] = useState(false);
  const [isLoadingSentences, setIsLoadingSentences] = useState(false);
  const [isCreatingSet, setIsCreatingSet] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFlashcardSettingsOpen, setIsFlashcardSettingsOpen] =
    useState(false);

  const loadSets = useCallback(
    async (preferredSetId?: string) => {
      setIsLoadingSets(true);
      setSetMessage("");

      try {
        const response = await fetch("/api/flashcard-sets");
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            router.replace("/signin");
            return;
          }

          setSetMessage(data.message ?? "セットの読み込みに失敗しました。");
          return;
        }

        const nextSets: FlashcardSet[] = Array.isArray(data.sets)
          ? data.sets
          : [];

        setSets(nextSets);
        setSelectedSetId((current) => {
          if (preferredSetId && nextSets.some((set) => set.id === preferredSetId)) {
            return preferredSetId;
          }

          if (current && nextSets.some((set) => set.id === current)) {
            return current;
          }

          return nextSets[0]?.id ?? "";
        });
      } catch {
        setSetMessage("セットの読み込みに失敗しました。");
      } finally {
        setIsLoadingSets(false);
      }
    },
    [router],
  );

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
    let ignore = false;

    async function checkAuth() {
      try {
        const response = await fetch("/api/me");
        const data = await response.json();

        if (ignore) return;

        if (!response.ok) {
          router.replace("/signin");
          return;
        }

        setUser(data.user);

        const statsResponse = await fetch("/api/characters");

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();

          setStats({
            monthlyCount: Number(statsData.monthlyCount ?? statsData.count ?? 0),
            totalCount: Number(statsData.totalCount ?? 0),
          });
        }
      } catch {
        if (!ignore) {
          router.replace("/signin");
        }
      } finally {
        if (!ignore) {
          setIsCheckingAuth(false);
        }
      }
    }

    checkAuth();

    return () => {
      ignore = true;
    };
  }, [router]);

  useEffect(() => {
    if (!user) return;

    loadSets();
  }, [loadSets, user]);

  useEffect(() => {
    if (!selectedSetId) {
      setSavedSentences([]);
      return;
    }

    loadSentences(selectedSetId);
  }, [loadSentences, selectedSetId]);

  function addRow() {
    setRows([...rows, { content: "", translation: "" }]);
    setRowErrors([...rowErrors, {}]);
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
    setRowErrors(
      rowErrors.map((error, rowIndex) =>
        rowIndex === index ? { ...error, [key]: undefined } : error,
      ),
    );
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/signin");
  }

  async function createSet() {
    setSetMessage("");
    setSetErrors({});

    const result = setSchema.safeParse({ name: newSetName });

    if (!result.success) {
      setSetErrors(result.error.flatten().fieldErrors);
      return;
    }

    setIsCreatingSet(true);

    try {
      const response = await fetch("/api/flashcard-sets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result.data),
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/signin");
          return;
        }

        if (data.fieldErrors) {
          setSetErrors(data.fieldErrors);
        }

        setSetMessage(data.message ?? "セットの作成に失敗しました。");
        return;
      }

      setNewSetName("");
      await loadSets(data.set?.id);
      setSetMessage("セットを作成しました。");
    } catch {
      setSetMessage("セットの作成に失敗しました。時間をおいてもう一度試してください。");
    } finally {
      setIsCreatingSet(false);
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
    setEditingRow({ content: "", translation: "" });
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
        headers: {
          "Content-Type": "application/json",
        },
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
      setSentenceListMessage("通信に失敗しました。時間をおいてもう一度試してください。");
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
        await loadSets(selectedSetId);
      }
    } catch {
      setSentenceListMessage("通信に失敗しました。時間をおいてもう一度試してください。");
    } finally {
      setSentenceActionId(null);
    }
  }

  async function requestSentenceRewrite(
    sentenceId: string,
    tone: RewriteTone,
  ) {
    setRewriteErrors((current) => removeRecordItem(current, sentenceId));
    setRewriteAction({ id: sentenceId, tone });

    try {
      const response = await fetch(`/api/sentences/${sentenceId}/rewrite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
        headers: {
          "Content-Type": "application/json",
        },
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

  async function saveRows() {
    setMessage("");
    setRowErrors(rows.map(() => ({})));

    if (!selectedSetId) {
      setMessage("保存先のセットを選択してください。");
      return;
    }

    const sentences = rows
      .map((row) => ({
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
        headers: {
          "Content-Type": "application/json",
        },
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

        setMessage(data.message ?? "保存に失敗しました。入力内容を確認してください。");
        return;
      }

      setRows([{ content: "", translation: "" }]);
      setRowErrors([{}]);
      setMessage(`${data.count ?? completedSentences.length}件保存しました。`);
      await Promise.all([loadSets(selectedSetId), loadSentences(selectedSetId)]);
    } catch {
      setMessage("通信に失敗しました。時間をおいてもう一度試してください。");
    } finally {
      setIsSaving(false);
    }
  }

  if (isCheckingAuth || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-600 p-6">
        <p className="cursor-default select-none text-sm text-white/80">
          読み込み中...
        </p>
      </div>
    );
  }

  const selectedSet = sets.find((set) => set.id === selectedSetId);

  return (
    <>
    <div
      className="min-h-screen bg-sky-600 p-4 md:p-8"
      aria-hidden={isFlashcardSettingsOpen}
      inert={isFlashcardSettingsOpen ? true : undefined}
    >
      <div className="mx-auto w-full max-w-md md:max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 md:grid md:grid-cols-[1fr_auto_1fr] md:items-start">
          <div>
            <h1 className="cursor-default select-none text-2xl font-bold text-white">
              マイページ
            </h1>
            {user && (
              <p className="mt-2 cursor-default select-none text-sm text-sky-100">
                {user.username}さん
              </p>
            )}
            <Link
              href="/editmyinfo"
              className="mt-3 inline-flex rounded-lg bg-white/95 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm transition-colors hover:bg-sky-50"
            >
              アカウント
            </Link>
            <p className="mt-4 cursor-default select-none text-sky-50">
              1ヶ月以内に暗唱した数：
              <span className="ml-2 align-middle text-2xl font-bold text-white">
                {stats.monthlyCount}
              </span>
            </p>
            <p className="cursor-default select-none text-sky-50">
              これまでに暗唱した数：
              <span className="ml-2 align-middle text-2xl font-bold text-emerald-200">
                {stats.totalCount}
              </span>
            </p>
          </div>

          <CharacterStatus />

          <div className="flex justify-start md:justify-end">
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-white/40 bg-sky-500 px-5 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-sky-400"
            >
              ログアウト
            </button>
          </div>
        </div>

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
                  onChange={(event) => setSelectedSetId(event.target.value)}
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
                    onChange={(event) => {
                      setNewSetName(event.target.value);
                      setSetErrors({});
                    }}
                    placeholder="例: 旅行英会話"
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
                  />
                  <button
                    type="button"
                    onClick={createSet}
                    disabled={isCreatingSet}
                    className="rounded-lg bg-sky-500 px-4 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {isCreatingSet ? "作成中..." : "セット作成"}
                  </button>
                </div>
                {setErrors.name?.[0] && (
                  <p className="mt-1 text-sm text-red-500">
                    {setErrors.name[0]}
                  </p>
                )}
              </div>
            </div>

            {flashcardSetMessage && (
              <p className="mt-3 text-sm text-slate-600">
                {flashcardSetMessage}
              </p>
            )}
          </div>

          <div className="grid gap-6 pt-5 md:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
            <section>
              <h2 className="mb-4 text-base font-bold text-slate-800">
                文章入力
              </h2>

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
                        onChange={(e) =>
                          updateRow(index, "content", e.target.value)
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
                        onChange={(e) =>
                          updateRow(index, "translation", e.target.value)
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

              {message && (
                <p className="mt-4 text-sm text-slate-600">{message}</p>
              )}

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
                  disabled={isSaving || !selectedSetId}
                  className="rounded-lg bg-sky-500 px-5 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSaving ? "保存中..." : "保存"}
                </button>
              </div>
            </section>

            <section className="border-t border-slate-100 pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="min-w-0 truncate text-base font-bold text-slate-800">
                  {selectedSet ? selectedSet.name : "選択中セット"}
                </h2>
                <p className="shrink-0 text-sm font-semibold text-sky-600">
                  {savedSentences.length}件
                </p>
              </div>

              {sentenceListMessage && (
                <p className="mb-3 text-sm text-slate-600">
                  {sentenceListMessage}
                </p>
              )}

              {isLoadingSentences ? (
                <p className="text-sm text-slate-500">読み込み中...</p>
              ) : savedSentences.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-sm leading-6 text-slate-500">
                  このセットにはまだカードがありません。
                </p>
              ) : (
                <ul className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
                  {savedSentences.map((sentence) => {
                    const rewriteSuggestion = rewriteSuggestions[sentence.id];
                    const rewriteError = rewriteErrors[sentence.id];
                    const isRewritingThis =
                      rewriteAction?.id === sentence.id;
                    const isCasualRewriting =
                      isRewritingThis && rewriteAction?.tone === "casual";
                    const isFormalRewriting =
                      isRewritingThis && rewriteAction?.tone === "formal";
                    const isSentenceBusy = sentenceActionId === sentence.id;

                    return (
                      <li
                        key={sentence.id}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                      >
                        {editingSentenceId === sentence.id ? (
                          <div className="space-y-3">
                            <div>
                              <label className="mb-1 block text-xs font-semibold text-slate-600">
                                英文
                              </label>
                              <textarea
                                value={editingRow.content}
                                onChange={(event) =>
                                  updateEditingRow(
                                    "content",
                                    event.target.value,
                                  )
                                }
                                className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-900 focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100"
                              />
                              {editingErrors.content && (
                                <p className="mt-1 text-sm text-red-500">
                                  {editingErrors.content}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-semibold text-slate-600">
                                日本語訳
                              </label>
                              <textarea
                                value={editingRow.translation}
                                onChange={(event) =>
                                  updateEditingRow(
                                    "translation",
                                    event.target.value,
                                  )
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
                                onClick={() => saveSentenceEdit(sentence.id)}
                                disabled={isSentenceBusy}
                                className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                              >
                                {isSentenceBusy ? "保存中..." : "保存"}
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditingSentence}
                                disabled={isSentenceBusy}
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
                                  AI添削：
                                  {rewriteToneLabels[rewriteSuggestion.tone]}
                                </p>
                                <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">
                                  {rewriteSuggestion.text}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      applyRewriteSuggestion(sentence.id)
                                    }
                                    disabled={isSentenceBusy}
                                    className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                                  >
                                    {isSentenceBusy ? "変更中..." : "変更する"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      requestSentenceRewrite(
                                        sentence.id,
                                        rewriteSuggestion.tone,
                                      )
                                    }
                                    disabled={Boolean(rewriteAction)}
                                    className="rounded-lg border border-sky-100 bg-white px-3 py-1.5 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {isRewritingThis ? "生成中..." : "もう一回"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      cancelRewriteSuggestion(sentence.id)
                                    }
                                    disabled={isSentenceBusy}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    キャンセル
                                  </button>
                                </div>
                              </div>
                            )}

                            {rewriteError && (
                              <p className="mt-2 text-sm text-red-500">
                                {rewriteError}
                              </p>
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
                                  onClick={() =>
                                    requestSentenceRewrite(
                                      sentence.id,
                                      "casual",
                                    )
                                  }
                                  disabled={Boolean(rewriteAction)}
                                  className="rounded-lg border border-emerald-100 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isCasualRewriting
                                    ? "生成中..."
                                    : "カジュアルに"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    requestSentenceRewrite(
                                      sentence.id,
                                      "formal",
                                    )
                                  }
                                  disabled={Boolean(rewriteAction)}
                                  className="rounded-lg border border-indigo-100 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isFormalRewriting
                                    ? "生成中..."
                                    : "フォーマルに"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => startEditingSentence(sentence)}
                                  disabled={isSentenceBusy}
                                  className="rounded-lg border border-sky-100 bg-white px-3 py-1.5 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  編集
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteSentence(sentence.id)}
                                  disabled={isSentenceBusy}
                                  className="rounded-lg border border-red-100 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isSentenceBusy ? "処理中..." : "削除"}
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
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
