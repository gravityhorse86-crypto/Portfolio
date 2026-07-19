export type UserInfo = {
  id: string;
  username: string;
  email: string;
};

export type StudyStats = {
  monthlyCount: number;
  totalCount: number;
};

export type SentenceRow = {
  content: string;
  translation: string;
};

export type SentenceStatusId = "0" | "1" | "2";

export type FlashcardSet = {
  id: string;
  name: string;
  sentenceCount: number;
};

export type SavedSentence = {
  id: string;
  content: string;
  translation: string;
  status_id: SentenceStatusId;
  created_at: string;
};

export type RewriteTone = "casual" | "formal";

export type RewriteSuggestion = {
  tone: RewriteTone;
  text: string;
};

export type SentenceRowErrors = Partial<Record<keyof SentenceRow, string>>;
export type SetFieldErrors = Partial<Record<"name", string[]>>;
