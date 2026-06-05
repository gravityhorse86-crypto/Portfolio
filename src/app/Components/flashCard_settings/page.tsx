"use client";

export default function FlashcardSettings() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto w-full max-w-md md:max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        
        <h1 className="mb-8 text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
          <span className="h-5 w-1.5 rounded-full bg-sky-500"></span>
          フラッシュカードの設定
        </h1>

        <div className="flex flex-col gap-8">
          
          <div className="flex flex-col gap-4">
            {/* フィルター */}
            <div className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 hover:border-sky-200 hover:bg-sky-50 transition-all cursor-pointer">
              <div>
                <p className="font-semibold text-slate-700 group-hover:text-sky-700">フィルター</p>
                <p className="text-xs text-slate-400">表示するカードの種類を絞り込みます</p>
              </div>
              <span className="text-slate-400 group-hover:text-sky-500">→</span>
            </div>

            <div className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 hover:border-sky-200 hover:bg-sky-50 transition-all cursor-pointer">
              <div>
                <p className="font-semibold text-slate-700 group-hover:text-sky-700">並び替え</p>
                <p className="text-xs text-slate-400">表示順（作成日・アルファベット順など）を変更します</p>
              </div>
              <span className="text-slate-400 group-hover:text-sky-500">→</span>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-6">
            <button className="w-full rounded-xl bg-slate-100 py-3 font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all">
              設定を終了して戻る
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}