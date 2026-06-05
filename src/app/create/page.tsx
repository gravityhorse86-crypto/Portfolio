"use client";

import { Sentence } from "@prisma/client";
import { useState } from "react";

const card: Sentence = {
  id: "",
  content: "",
  translation: "",
  casualText: null,
  formalText: null,
  created_at: new Date(),
  updated_at: new Date(),
  status_id: "", // 習得状況　覚えてない=2,怪しい=1,覚えた=0
  statusUpdated_at: new Date(),
};

export default function Create() {
  const [sentence, setSentence] = useState<Sentence[]>([card]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto w-full max-w-md md:max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        {/* ヘッダー・ナビ部分 */}
        <div className="mb-8 border-b border-slate-100 pb-4">
          <ul className="flex gap-6 text-sm font-medium text-slate-500">
            <li className="cursor-pointer hover:text-sky-600 transition-colors">
              フィルター
            </li>
            <li className="cursor-pointer hover:text-sky-600 transition-colors">
              並び替え
            </li>
          </ul>
        </div>

        {/* フォームエリア */}
        <div className="flex flex-col gap-6">
          {/* 暗唱文入力 */}
          <div>
            <label
              htmlFor="object"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              暗唱したい文
            </label>
            <input
              type="text"
              name="object"
              placeholder="例: I've been looking forward to meeting you."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
            />
          </div>

          {/* アクションボタン */}
          <div className="flex flex-wrap gap-3">
            <button className="rounded-xl bg-sky-500 px-6 py-2.5 font-bold text-white shadow-md shadow-sky-200 hover:bg-sky-600 active:scale-95 transition-all">
              作成する
            </button>
            <button className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-2.5 text-sm font-medium text-sky-700 hover:bg-sky-100 transition-colors">
              カジュアル変換
            </button>
            <button className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-2.5 text-sm font-medium text-sky-700 hover:bg-sky-100 transition-colors">
              フォーマル変換
            </button>
          </div>

          {/* 訳入力 */}
          <div>
            <label
              htmlFor="translation"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              日本語訳
            </label>
            <input
              type="text"
              name="translation"
              placeholder="例: お会いできるのを楽しみにしていました。"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
