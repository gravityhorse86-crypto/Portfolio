"use client";

export default function EditMyInfo() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto w-full max-w-md md:max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        {/* 見出し */}
        <h1 className="mb-8 text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">
          ユーザー情報編集
        </h1>

        {/* 編集フォーム */}
        <div className="flex flex-col gap-6">
          {/* ID (編集不可なら readOnly を付けるのもあり) */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              ID
            </label>
            <input
              type="text"
              name="id"
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500 cursor-not-allowed focus:outline-none"
              defaultValue="user_id_12345"
              readOnly
            />
            <p className="mt-1 text-xs text-slate-400">※IDは変更できません</p>
          </div>

          {/* ユーザー名 */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              ユーザー名
            </label>
            <input
              type="text"
              name="username"
              placeholder="新しいユーザー名を入力"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
            />
          </div>

          {/* メールアドレス */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              メールアドレス
            </label>
            <input
              type="email"
              name="email"
              placeholder="example@mail.com"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
            />
          </div>

          {/* パスワード */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              新しいパスワード
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
            />
          </div>

          {/* 更新ボタン */}
          <div className="mt-4">
            <button className="w-full md:w-auto rounded-xl bg-sky-500 px-10 py-3 font-bold text-white shadow-md shadow-sky-200 hover:bg-sky-600 active:scale-95 transition-all">
              更新する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
