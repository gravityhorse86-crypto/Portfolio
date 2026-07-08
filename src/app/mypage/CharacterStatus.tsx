"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

function getCharacterSrc(count: number): string {
  if (count >= 50) return "/img/god.png";
  if (count >= 21) return "/img/queen.png";
  if (count >= 11) return "/img/aristocracy.png";
  if (count >= 5) return "/img/ordinary.png";
  return "/img/poor.png";
}

function getCharacterLevel(count: number): number {
  if (count >= 50) return 5;
  if (count >= 21) return 4;
  if (count >= 11) return 3;
  if (count >= 5) return 2;
  return 1;
}

export function CharacterStatus() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/characters")
      .then((res) => {
        if (!res.ok) {
          return { count: 0 };
        }

        return res.json();
      })
      .then((data: { count: number }) => setCount(data.count))
      .catch(() => setCount(0));
  }, []);

  if (count === null) return null;

  return (
    <div className="flex items-center gap-4 md:flex-col md:gap-2">
      <Image
        src={getCharacterSrc(count)}
        alt="キャラクター"
        width={180}
        height={180}
        className="h-40 w-40 md:h-44 md:w-44"
      />
      <p className="rounded-lg bg-white px-4 py-2 text-base font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
        レベル：{getCharacterLevel(count)}
      </p>
    </div>
  );
}
