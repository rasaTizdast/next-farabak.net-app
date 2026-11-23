CREATE SCHEMA IF NOT EXISTS "contact_us";

CREATE TABLE IF NOT EXISTS "contact_us"."ContactSubmission" (
  "id" SERIAL NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "phone" VARCHAR(16) NOT NULL,
  "project" VARCHAR(160),
  "message" VARCHAR(5000) NOT NULL,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContactSubmission_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ContactSubmission_id_desc_idx"
  ON "contact_us"."ContactSubmission" ("id" DESC);
