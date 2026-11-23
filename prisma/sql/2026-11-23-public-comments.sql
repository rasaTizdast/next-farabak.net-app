-- Apply in one transaction: psql --single-transaction --set=ON_ERROR_STOP=1 --file=<this file>.
-- Verify legacy source and imported rows before deploying the application.
-- Before application cutover, rollback may drop support."PublicComment" and its two enums.
-- After cutover, retain the table on application rollback to preserve new submissions.

DO $$
BEGIN
  CREATE TYPE support."CommentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END;
$$;

DO $$
BEGIN
  CREATE TYPE support."CommentPresentation" AS ENUM ('MEMBER', 'ALIAS', 'EDITORIAL', 'LEGACY');
EXCEPTION WHEN duplicate_object THEN NULL;
END;
$$;

CREATE TABLE IF NOT EXISTS support."PublicComment" (
  id serial CONSTRAINT "PublicComment_pkey" PRIMARY KEY,
  "blogId" integer,
  "productId" integer,
  "parentId" integer,
  "actorId" integer,
  "displayName" varchar(80) NOT NULL,
  body varchar(2000) NOT NULL,
  status support."CommentStatus" NOT NULL DEFAULT 'PENDING',
  presentation support."CommentPresentation" NOT NULL,
  "createdAt" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "publishedAt" timestamptz(6),
  "reviewedAt" timestamptz(6),
  "reviewerId" integer,
  "reviewNote" varchar(1000),
  "legacyBlogCommentId" integer,
  CONSTRAINT "PublicComment_exactly_one_target_check"
    CHECK (("blogId" IS NULL) <> ("productId" IS NULL)),
  CONSTRAINT "PublicComment_no_self_reply_check" CHECK ("parentId" <> id),
  CONSTRAINT "PublicComment_blogId_fkey"
    FOREIGN KEY ("blogId") REFERENCES blog."Blogs"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PublicComment_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES support."Product"("ProductId") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PublicComment_actorId_fkey"
    FOREIGN KEY ("actorId") REFERENCES info."Client"("UserID") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "PublicComment_reviewerId_fkey"
    FOREIGN KEY ("reviewerId") REFERENCES info."Client"("UserID") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "PublicComment_parentId_fkey"
    FOREIGN KEY ("parentId") REFERENCES support."PublicComment"(id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "PublicComment_legacyBlogCommentId_key"
  ON support."PublicComment" ("legacyBlogCommentId");
CREATE INDEX IF NOT EXISTS "PublicComment_blogId_status_createdAt_idx"
  ON support."PublicComment" ("blogId", status, "createdAt");
CREATE INDEX IF NOT EXISTS "PublicComment_productId_status_createdAt_idx"
  ON support."PublicComment" ("productId", status, "createdAt");
CREATE INDEX IF NOT EXISTS "PublicComment_actorId_createdAt_idx"
  ON support."PublicComment" ("actorId", "createdAt");
CREATE INDEX IF NOT EXISTS "PublicComment_status_createdAt_idx"
  ON support."PublicComment" (status, "createdAt");

-- Keep source bodies and legacy date strings in blog."Comments". Import using the new
-- body length limit and the migration timestamp because the old date format is unspecified.
INSERT INTO support."PublicComment" ("blogId", "displayName", body, status, presentation, "legacyBlogCommentId")
SELECT blog_id, 'کاربر پیشین', left(content, 2000), 'PENDING', 'LEGACY', id
FROM blog."Comments"
ON CONFLICT ("legacyBlogCommentId") DO NOTHING;
