import { prisma } from "@/lib/prisma";

import { FlashcardClient } from "./FlashcardClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FlashcardPageProps = {
  searchParams: Promise<{
    status?: string;
    sort?: string;
  }>;
};

export default async function Flashcard({ searchParams }: FlashcardPageProps) {
  const params = await searchParams;
  const where: { status_id?: "0" | "1" | "2" } = {};

  if (params.status === "0" || params.status === "1" || params.status === "2") {
    where.status_id = params.status;
  }

  const orderBy: { created_at: "asc" | "desc" } = {
    created_at: params.sort === "oldest" ? "asc" : "desc",
  };

  const sentences = await prisma.sentence.findMany({
    where,
    orderBy,
    select: {
      id: true,
      content: true,
      translation: true,
    },
  });

  return <FlashcardClient sentences={sentences} />;
}
