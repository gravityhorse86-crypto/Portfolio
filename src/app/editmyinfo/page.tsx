"use client";

import { useEffect, useState } from "react";
import { z } from "zod";

const editMyInfoSchema = z
  .object({
    username: z.string().trim().min(1, "ユーザー名は必須です"),
    email: z.string().trim().email("メールアドレスの形式が正しくありません"),
    currentPassword: z.string(),
    newPassword: z.string(),
  })
  .superRefine((value, context) => {
    if (!value.newPassword) return;

    if (value.newPassword.length < 8) {
      context.addIssue({
        code: "custom",
        path: ["newPassword"],
        message: "新しいパスワードは8文字以上で入力してください",
      });
    }

    if (!value.currentPassword) {
      context.addIssue({
        code: "custom",
        path: ["currentPassword"],
        message: "パスワードを変更するには現在のパスワードを入力してください",
      });
    }
  });

type FieldErrors = Record<string, string[] | undefined>;

type UserInfo = {
  id: string;
  username: string;
  email: string;
};

export default function EditMyInfo() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadUser() {
      try {
        const response = await fetch("/api/me");
        const data = await response.json();

        if (ignore) return;

        if (!response.ok) {
          setMessage(data.message ?? "ユーザー情報を取得できませんでした。");
          return;
        }

        setUser(data.user);
        setUsername(data.user.username);
        setEmail(data.user.email);
      } catch {
        if (!ignore) {
          setMessage("通信に失敗しました。時間をおいてもう一度お試しください。");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const values = {
      username,
      email,
      currentPassword,
      newPassword,
    };
    const result = editMyInfoSchema.safeParse(values);

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    setErrors({});
    setIsSaving(true);

    try {
      const response = await fetch("/api/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result.data),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.fieldErrors) {
          setErrors(data.fieldErrors);
        }

        setMessage(data.message ?? "ユーザー情報の更新に失敗しました。");
        return;
      }

      setUser(data.user);
      setUsername(data.user.username);
      setEmail(data.user.email);
      setCurrentPassword("");
      setNewPassword("");
      setMessage("ユーザー情報を更新しました。");
    } catch {
      setMessage("通信に失敗しました。時間をおいてもう一度お試しください。");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto w-full max-w-md md:max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="mb-8 border-b border-slate-100 pb-4 text-xl font-bold text-slate-800">
          ユーザー情報編集
        </h1>

        {isLoading ? (
          <p className="text-sm text-slate-500">読み込み中...</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                ID
              </label>
              <input
                type="text"
                name="id"
                value={user?.id ?? ""}
                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500 focus:outline-none"
                readOnly
              />
              <p className="mt-1 text-xs text-slate-400">※IDは変更できません</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                ユーザー名
              </label>
              <input
                type="text"
                name="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="新しいユーザー名を入力"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
              />
              {errors.username?.[0] && (
                <p className="mt-1 text-sm text-red-500">{errors.username[0]}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                メールアドレス
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="example@mail.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
              />
              {errors.email?.[0] && (
                <p className="mt-1 text-sm text-red-500">{errors.email[0]}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                現在のパスワード
              </label>
              <input
                type="password"
                name="currentPassword"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="パスワード変更時のみ入力"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
              />
              {errors.currentPassword?.[0] && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.currentPassword[0]}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                新しいパスワード
              </label>
              <input
                type="password"
                name="newPassword"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="8文字以上"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
              />
              {errors.newPassword?.[0] && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.newPassword[0]}
                </p>
              )}
            </div>

            {message && <p className="text-sm text-slate-600">{message}</p>}

            <div className="mt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full rounded-xl bg-sky-500 px-10 py-3 font-bold text-white shadow-md shadow-sky-200 transition-all hover:bg-sky-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 md:w-auto"
              >
                {isSaving ? "更新中..." : "更新する"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
