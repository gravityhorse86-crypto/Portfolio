-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "encrypted_password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sentence" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "casualText" TEXT,
    "formalText" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status_id" TEXT NOT NULL,

    CONSTRAINT "Sentence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentenceStatus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "SentenceStatus_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Sentence" ADD CONSTRAINT "Sentence_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "SentenceStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
