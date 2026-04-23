"use client";

export default function Signin() {
  return (
  
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex items-center justify-center">
      
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-10">
        

        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">ようこそ</h1>
          <p className="text-sm text-slate-500">
            ログインして学習を再開しましょう。
          </p>
        </div>

        <div className="flex flex-col gap-6">
          
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 ml-1">ID</label>
            <input 
              type="text" 
              name="id" 
              placeholder="あなたのIDを入力"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 ml-1">パスワード</label>
            <input 
              type="password" 
              name="password" 
              placeholder="パスワードを入力"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
            />
          </div>


          <div className="mt-2">
            <button className="w-full rounded-2xl bg-sky-500 py-3.5 font-bold text-white shadow-lg shadow-sky-100 hover:bg-sky-600 active:scale-95 transition-all">
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

    
          <button className="w-full rounded-2xl border border-sky-100 bg-sky-50 py-3 text-sm font-bold text-sky-700 hover:bg-sky-100 transition-colors">
            新しくアカウントを作る
          </button>

        </div>
      </div>
    </div>
  );
}