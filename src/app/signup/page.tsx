"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useState } from "react";

const signupSchema = z.object({
  id: z
    .string()
    .min(1, "IDは必須です")
    .regex(/^[a-zA-Z0-9_]+$/, "IDは英数字と_だけで入力してください"),
  username: z.string().min(1, "ユーザー名は必須です"),
  email: z.string().email("メールアドレスの形式が正しくありません"),
  password: z.string().min(8, "パスワードは8文字以上でなければなりません"),
});

type FieldErrors = Record<string, string[] | undefined>;

export default function Signup() {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const values = {
      id: String(formData.get("id") ?? ""),
      username: String(formData.get("username") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    const result = signupSchema.safeParse(values);

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
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

        setMessage(data.message ?? "登録に失敗しました");
        return;
      }

      form.reset();
      setMessage(`${data.user?.username ?? "ユーザー"}さんを登録しました`);
      router.push("/mypage");
    } catch {
      setMessage("通信に失敗しました。時間をおいてもう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-10">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">新規登録</h1>
          <p className="text-sm text-slate-500">
            アカウントを作成して、暗唱学習を始めましょう！
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 ml-1">
              ID
            </label>
            <input
              type="text"
              name="id"
              placeholder="英数字で入力してください"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
            />
            {errors.id?.[0] && (
              <p className="mt-1 text-sm text-red-500">{errors.id[0]}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 ml-1">
              ユーザー名
            </label>
            <input
              type="text"
              name="username"
              placeholder="表示名（あとで変更可能）"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
            />
            {errors.username?.[0] && (
              <p className="mt-1 text-sm text-red-500">{errors.username[0]}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 ml-1">
              メールアドレス
            </label>
            <input
              type="email"
              name="email"
              placeholder="example@mail.com"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
            />
            {errors.email?.[0] && (
              <p className="mt-1 text-sm text-red-500">{errors.email[0]}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 ml-1">
              パスワード
            </label>
            <input
              type="password"
              name="password"
              placeholder="8文字以上の英数字"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
            />
            {errors.password?.[0] && (
              <p className="mt-1 text-sm text-red-500">{errors.password[0]}</p>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-4">
            {message && (
              <p className="text-sm text-slate-600">{message}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-sky-500 py-3.5 font-bold text-white shadow-lg shadow-sky-100 hover:bg-sky-600 active:scale-95 transition-all"
            >
              {isSubmitting ? "登録中..." : "新規登録する"}
            </button>

            <Link
              href="/signin"
              className="w-full py-2 text-sm font-medium text-slate-400 hover:text-sky-600 transition-colors"
            >
              すでにアカウントをお持ちの方はこちら
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
