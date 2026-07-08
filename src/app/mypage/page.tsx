"use client";

import { useEffect, useState } from "react";
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

type SentenceRowErrors = Partial<Record<keyof SentenceRow, string>>;

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
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isFlashcardSettingsOpen, setIsFlashcardSettingsOpen] =
    useState(false);

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

  async function saveRows() {
    setMessage("");
    setRowErrors(rows.map(() => ({})));

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
        body: JSON.stringify({ sentences: completedSentences }),
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
    } catch {
      setMessage("通信に失敗しました。時間をおいてもう一度試してください。");
    } finally {
      setIsSaving(false);
    }
  }

  if (isCheckingAuth || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <p className="text-sm text-slate-500">読み込み中...</p>
      </div>
    );
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
            {user && (
              <p className="mt-2 text-sm text-slate-500">
                {user.username}さん
              </p>
            )}
            <p className="mt-4 text-slate-600">
              1ヶ月以内に暗唱した数：
              <span className="ml-2 align-middle text-2xl font-bold text-sky-600">
                {stats.monthlyCount}
              </span>
            </p>
            <p className="text-slate-600">
              これまでに暗唱した数：
              <span className="ml-2 align-middle text-2xl font-bold text-emerald-600">
                {stats.totalCount}
              </span>
            </p>
          </div>

          <CharacterStatus />

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setIsFlashcardSettingsOpen(true)}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              フラッシュカードへ
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-100"
            >
              ログアウト
            </button>
          </div>
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
