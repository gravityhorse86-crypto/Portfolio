import { prisma } from "@/lib/prisma";
import { isPrismaErrorCode } from "@/lib/prisma-error";

export const defaultFlashcardSetName = "マイセット";

export async function ensureDefaultFlashcardSet(userId: string) {
  const existingSet = await prisma.flashcardSet.findFirst({
    where: { user_id: userId },
    orderBy: { created_at: "asc" },
    select: {
      id: true,
      name: true,
    },
  });

  if (existingSet) {
    return existingSet;
  }

  try {
    return await prisma.flashcardSet.create({
      data: {
        name: defaultFlashcardSetName,
        user_id: userId,
      },
      select: {
        id: true,
        name: true,
      },
    });
  } catch (error) {
    if (!isPrismaErrorCode(error, "P2002")) {
      throw error;
    }

    const createdSet = await prisma.flashcardSet.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: "asc" },
      select: {
        id: true,
        name: true,
      },
    });

    if (!createdSet) {
      throw error;
    }

    return createdSet;
  }
}
