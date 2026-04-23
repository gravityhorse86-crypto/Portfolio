"use client";

import Sentence from "../types/type";
import { useState } from "react";

export default function List() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* 画面幅の統一 */}
      <div className="mx-auto w-full max-w-md md:max-w-2xl">
        
        {/* ヘッダー部分：タイトルと「作成」への誘導 */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="h-5 w-1.5 rounded-full bg-sky-500"></span>
            暗唱カード一覧
          </h1>
          <button className="rounded-full bg-sky-500 p-2 text-white shadow-lg shadow-sky-200 hover:bg-sky-600 transition-all">
            {/* プラスアイコンの代わり */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* フィルター・並び替えのクイック操作 */}
        <div className="mb-6 flex gap-4">
          <button className="text-sm font-medium text-sky-600 bg-sky-50 px-3 py-1 rounded-full hover:bg-sky-100 transition-colors">
            すべて表示
          </button>
          <button className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors">
            未完了のみ
          </button>
        </div>

        {/* カードリスト */}
        <div className="flex flex-col gap-4">
          {/* サンプルカード1 */}
          <div className="group bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-sky-300 transition-all cursor-pointer">
            <div className="flex flex-col gap-2">
              <p className="text-lg font-semibold text-slate-800 group-hover:text-sky-700">
                Looking forward to meeting you.
              </p>
              <p className="text-sm text-slate-500">
                お会いできるのを楽しみにしていました。
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                Formal
              </span>
              <span className="text-xs text-slate-400">2026.04.23</span>
            </div>
          </div>

          {/* サンプルカード2 */}
          <div className="group bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-sky-300 transition-all cursor-pointer">
            <div className="flex flex-col gap-2">
              <p className="text-lg font-semibold text-slate-800 group-hover:text-sky-700">
                Cant wait to see ya!
              </p>
              <p className="text-sm text-slate-500">
                会えるの超楽しみ！
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
                Casual
              </span>
              <span className="text-xs text-slate-400">2026.04.22</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
