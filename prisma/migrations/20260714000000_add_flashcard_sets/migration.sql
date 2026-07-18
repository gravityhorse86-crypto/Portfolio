-- CreateTable
CREATE TABLE "FlashcardSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlashcardSet_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Sentence" ADD COLUMN "flashcard_set_id" TEXT;
ALTER TABLE "Sentence" ADD COLUMN "user_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "FlashcardSet_user_id_name_key" ON "FlashcardSet"("user_id", "name");

-- CreateIndex
CREATE INDEX "FlashcardSet_user_id_idx" ON "FlashcardSet"("user_id");

-- CreateIndex
CREATE INDEX "Sentence_user_id_idx" ON "Sentence"("user_id");

-- CreateIndex
CREATE INDEX "Sentence_flashcard_set_id_idx" ON "Sentence"("flashcard_set_id");

-- AddForeignKey
ALTER TABLE "Sentence" ADD CONSTRAINT "Sentence_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sentence" ADD CONSTRAINT "Sentence_flashcard_set_id_fkey" FOREIGN KEY ("flashcard_set_id") REFERENCES "FlashcardSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashcardSet" ADD CONSTRAINT "FlashcardSet_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
