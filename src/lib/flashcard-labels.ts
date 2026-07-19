import type { RewriteTone, SentenceStatusId } from "@/types/flashcard";

export const statusLabels: Record<SentenceStatusId, string> = {
  "0": "覚えた",
  "1": "怪しい",
  "2": "覚えてない",
};

export const rewriteToneLabels: Record<RewriteTone, string> = {
  casual: "カジュアル",
  formal: "フォーマル",
};

export function removeRecordItem<T>(record: Record<string, T>, key: string) {
  const nextRecord = { ...record };
  delete nextRecord[key];
  return nextRecord;
}
