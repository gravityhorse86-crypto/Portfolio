"use client";

export default function Signup() {
  return (

    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex items-center justify-center">
      

      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-10">
 
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">新規登録</h1>
          <p className="text-sm text-slate-500">
            アカウントを作成して、暗唱学習を始めましょう！
          </p>
        </div>

        <div className="flex flex-col gap-5">
          
  
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 ml-1">ID</label>
            <input 
              type="text" 
              name="id" 
              placeholder="英数字で入力してください"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 ml-1">ユーザー名</label>
            <input 
              type="text" 
              name="username" 
              placeholder="表示名（あとで変更可能）"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 ml-1">メールアドレス</label>
            <input 
              type="email" 
              name="email" 
              placeholder="example@mail.com"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 ml-1">パスワード</label>
            <input 
              type="password" 
              name="password" 
              placeholder="8文字以上の英数字"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
            />
          </div>

          <div className="mt-4 flex flex-col gap-4">
            <button className="w-full rounded-2xl bg-sky-500 py-3.5 font-bold text-white shadow-lg shadow-sky-100 hover:bg-sky-600 active:scale-95 transition-all">
              新規登録する
            </button>
            
            <button className="w-full py-2 text-sm font-medium text-slate-400 hover:text-sky-600 transition-colors">
              すでにアカウントをお持ちの方はこちら
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
