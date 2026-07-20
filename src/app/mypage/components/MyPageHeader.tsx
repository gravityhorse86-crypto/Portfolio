import Link from "next/link";

import type { StudyStats } from "@/types/flashcard";

import { CharacterStatus } from "../CharacterStatus";

type MyPageHeaderProps = {
  username: string;
  stats: StudyStats;
  onLogout: () => void;
};

export function MyPageHeader({ username, stats, onLogout }: MyPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:grid md:grid-cols-[1fr_auto_1fr] md:items-start">
      <div>
        <h1 className="cursor-default select-none text-2xl font-bold text-sky-900">
          マイページ
        </h1>
        <p className="mt-2 cursor-default select-none text-sm text-sky-800">
          {username}さん
        </p>
        <Link
          href="/editmyinfo"
          className="mt-3 inline-flex rounded-lg bg-white/95 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm transition-colors hover:bg-sky-50"
        >
          アカウント
        </Link>
        <div className="mt-4 space-y-1">
          <p className="flex cursor-default select-none items-baseline text-sky-800">
            1ヶ月以内に暗唱した数：
            <span className="ml-1 text-xl font-bold leading-none text-sky-900">
              {stats.monthlyCount}
            </span>
          </p>
          <p className="flex cursor-default select-none items-baseline text-sky-800">
            これまでに暗唱した数：
            <span className="ml-1 text-xl font-bold leading-none text-sky-900">
              {stats.totalCount}
            </span>
          </p>
        </div>
      </div>

      <CharacterStatus />

      <div className="flex justify-start md:justify-end">
        <button
          type="button"
          onClick={onLogout}
          className="rounded-lg bg-sky-600 px-5 py-2.5 font-semibold text-white shadow-md transition-colors hover:bg-sky-700"
        >
          ログアウト
        </button>
      </div>
    </div>
  );
}
