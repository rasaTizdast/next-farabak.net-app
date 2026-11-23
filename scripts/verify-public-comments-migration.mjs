import { PrismaClient } from "@prisma/client";

async function verifyMigration() {
  if (!process.env.DATABASE_URL) {
    throw new Error("Set DATABASE_URL to the database whose comment migration you want to verify.");
  }

  const prisma = new PrismaClient();

  try {
    const [counts] = await prisma.$queryRaw`
      SELECT
        COUNT(legacy.id) AS source,
        COUNT(imported."legacyBlogCommentId") AS imported,
        COUNT(*) FILTER (WHERE
          legacy.id IS NULL OR imported."legacyBlogCommentId" IS NULL
          OR imported."blogId" IS DISTINCT FROM legacy.blog_id
        ) AS mismatched,
        COUNT(*) FILTER (WHERE char_length(legacy.content) > 2000) AS over_length
      FROM blog."Comments" AS legacy
      FULL JOIN (
        SELECT "legacyBlogCommentId", "blogId"
        FROM support."PublicComment"
        WHERE "legacyBlogCommentId" IS NOT NULL
      ) AS imported ON imported."legacyBlogCommentId" = legacy.id
    `;

    console.log(`Legacy comments in source: ${counts.source}`);
    console.log(`Imported legacy comments: ${counts.imported}`);
    console.log(`Legacy comments with missing or mismatched mappings: ${counts.mismatched}`);
    console.log(`Source comments above the 2000-character import limit: ${counts.over_length}`);

    if (counts.source !== counts.imported || counts.mismatched !== 0n) {
      throw new Error("Legacy comment migration verification failed.");
    }
  } finally {
    await prisma.$disconnect();
  }
}

try {
  await verifyMigration();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
