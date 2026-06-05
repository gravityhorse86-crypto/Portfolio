"use client";
import { useEffect, useState } from "react";

export default function Flashcard() {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipCard = () => {
    setIsFlipped((current) => !current);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        flipCard();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  
  return (
    <main className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
      <button
        type="button"
        onClick={flipCard}
        className="group h-80 w-full max-w-xl [perspective:1000px]"
        aria-label="フラッシュカードを裏返す"
      >
        <div
          className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          <section className="absolute inset-0 flex items-center justify-center rounded-lg bg-white p-8 text-center shadow-lg [backface-visibility:hidden]">
            <p className="text-2xl font-semibold leading-relaxed text-slate-800">
              I want to improve my ability to memorize English sentences.
            </p>
          </section>

          <section className="absolute inset-0 flex items-center justify-center rounded-lg bg-indigo-600 p-8 text-center shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <p className="text-2xl font-semibold leading-relaxed text-white">
              英文を暗記する力を伸ばしたいです。
            </p>
          </section>
        </div>
      </button>
    </main>
  );
}
