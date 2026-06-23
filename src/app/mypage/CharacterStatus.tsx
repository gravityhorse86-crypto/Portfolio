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

export function CharacterStatus() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/characters")
      .then((res) => res.json())
      .then((data: { count: number }) => setCount(data.count))
      .catch(() => setCount(0));
  }, []);

  if (count === null) return null;

  return (
    <Image
      src={getCharacterSrc(count)}
      alt="キャラクター"
      width={120}
      height={120}
    />
  );
}
