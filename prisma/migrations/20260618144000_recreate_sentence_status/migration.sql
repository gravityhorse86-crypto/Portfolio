CREATE TABLE IF NOT EXISTS "SentenceStatus" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  CONSTRAINT "SentenceStatus_pkey" PRIMARY KEY ("id")
);

INSERT INTO "SentenceStatus" ("id", "name")
VALUES
  ('0', '覚えた'),
  ('1', '怪しい'),
  ('2', '覚えてない')
ON CONFLICT ("id") DO NOTHING;

UPDATE "Sentence"
SET "status_id" = '2'
WHERE "status_id" NOT IN ('0', '1', '2');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Sentence_status_id_fkey'
  ) THEN
    ALTER TABLE "Sentence"
    ADD CONSTRAINT "Sentence_status_id_fkey"
    FOREIGN KEY ("status_id") REFERENCES "SentenceStatus"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
