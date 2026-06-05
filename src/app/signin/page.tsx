"use client";

import { z } from "zod";
import { useState } from "react";

const signinSchema = z.object({
  id: z.string().min(1, "IDは必須です"),
  password: z.string().min(1, "パスワードは必須です"),
});

type FieldErrors = Record<string, string[] | undefined>;

export default function Signin() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    const formData = new FormData(e.currentTarget);

    const values = {
      id: String(formData.get("id") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    const result = signinSchema.safeParse(values);

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    setErrors({});

    try {
      const response = await fetch("/api/signin", {
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

        setMessage(data.message ?? "ログインに失敗しました");
        return;
      }

      setMessage(`${data.user?.username ?? "ユーザー"}さん、ログイン成功です`);
    } catch {
      setMessage("通信に失敗しました。時間をおいてもう一度お試しください。");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex items-center justify-center">
      
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-10">
        

        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">ようこそ</h1>
          <p className="text-sm text-slate-500">
            ログインして学習を再開しましょう。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 ml-1">ID</label>
            <input 
              type="text" 
              name="id" 
              placeholder="あなたのIDを入力"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
            />
            {errors.id?.[0] && (
              <p className="mt-1 text-sm text-red-500">{errors.id[0]}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 ml-1">パスワード</label>
            <input 
              type="password" 
              name="password" 
              placeholder="パスワードを入力"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
            />
            {errors.password?.[0] && (
              <p className="mt-1 text-sm text-red-500">{errors.password[0]}</p>
            )}
          </div>


          <div className="mt-2">
            {message && (
              <p className="mb-4 text-sm text-slate-600">{message}</p>
            )}

            <button
              type="submit"
              className="w-full rounded-2xl bg-sky-500 py-3.5 font-bold text-white shadow-lg shadow-sky-100 hover:bg-sky-600 active:scale-95 transition-all"
            >
              ログインする
            </button>
          </div>

      
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">アカウントをお持ちでない方</span>
            </div>
          </div>

    
          <button
            type="button"
            className="w-full rounded-2xl border border-sky-100 bg-sky-50 py-3 text-sm font-bold text-sky-700 hover:bg-sky-100 transition-colors"
          >
            新しくアカウントを作る
          </button>

        </form>
      </div>
    </div>
  );
}
