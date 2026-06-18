INSERT INTO "SentenceStatus" ("id", "name")
VALUES
  ('0', '覚えた'),
  ('1', '怪しい'),
  ('2', '覚えてない')
ON CONFLICT ("id") DO NOTHING;

-- AlterTable
ALTER TABLE "Sentence" ADD COLUMN     "statusUpdated_at" TIMESTAMP(3),
ALTER COLUMN "status_id" SET DEFAULT '2';
