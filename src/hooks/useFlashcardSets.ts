"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { setSchema } from "@/lib/flashcard-schemas";
import type { FlashcardSet, SetFieldErrors } from "@/types/flashcard";

/**
 * フラッシュカードのセット一覧の取得・選択・作成を扱う。
 * @param enabled 認証確認が済んでから読み込みを開始するためのフラグ。
 */
export function useFlashcardSets(enabled: boolean) {
  const router = useRouter();
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [selectedSetId, setSelectedSetId] = useState("");
  const [isLoadingSets, setIsLoadingSets] = useState(false);
  const [newSetName, setNewSetName] = useState("");
  const [setErrors, setSetErrors] = useState<SetFieldErrors>({});
  const [isCreatingSet, setIsCreatingSet] = useState(false);
  const [message, setMessage] = useState("");

  const loadSets = useCallback(
    async (preferredSetId?: string) => {
      setIsLoadingSets(true);
      setMessage("");

      try {
        const response = await fetch("/api/flashcard-sets");
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            router.replace("/signin");
            return;
          }

          setMessage(data.message ?? "セットの読み込みに失敗しました。");
          return;
        }

        const nextSets: FlashcardSet[] = Array.isArray(data.sets)
          ? data.sets
          : [];

        setSets(nextSets);
        setSelectedSetId((current) => {
          if (
            preferredSetId &&
            nextSets.some((set) => set.id === preferredSetId)
          ) {
            return preferredSetId;
          }

          if (current && nextSets.some((set) => set.id === current)) {
            return current;
          }

          return nextSets[0]?.id ?? "";
        });
      } catch {
        setMessage("セットの読み込みに失敗しました。");
      } finally {
        setIsLoadingSets(false);
      }
    },
    [router],
  );

  useEffect(() => {
    if (!enabled) return;

    loadSets();
  }, [enabled, loadSets]);

  const createSet = useCallback(async () => {
    setMessage("");
    setSetErrors({});

    const result = setSchema.safeParse({ name: newSetName });

    if (!result.success) {
      setSetErrors(result.error.flatten().fieldErrors);
      return;
    }

    setIsCreatingSet(true);

    try {
      const response = await fetch("/api/flashcard-sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/signin");
          return;
        }

        if (data.fieldErrors) {
          setSetErrors(data.fieldErrors);
        }

        setMessage(data.message ?? "セットの作成に失敗しました。");
        return;
      }

      setNewSetName("");
      await loadSets(data.set?.id);
      setMessage("セットを作成しました。");
    } catch {
      setMessage(
        "セットの作成に失敗しました。時間をおいてもう一度試してください。",
      );
    } finally {
      setIsCreatingSet(false);
    }
  }, [loadSets, newSetName, router]);

  const selectedSet = sets.find((set) => set.id === selectedSetId);

  return {
    sets,
    selectedSet,
    selectedSetId,
    setSelectedSetId,
    isLoadingSets,
    newSetName,
    setNewSetName,
    setErrors,
    setSetErrors,
    message,
    isCreatingSet,
    createSet,
    loadSets,
  };
}
