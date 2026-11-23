// @vitest-environment node

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

function executeSql(connection: string, sql: string) {
  const url = new URL(connection);
  const database = url.pathname.slice(1);
  const appDatabase = process.env.DATABASE_URL && new URL(process.env.DATABASE_URL);

  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
    !/^farabak_comments_test_[a-z0-9_]+$/.test(database) ||
    (appDatabase && decodeURIComponent(appDatabase.pathname.slice(1)) === database)
  ) {
    throw new Error(
      "TEST_DATABASE_URL must name a dedicated local farabak_comments_test_* database distinct from DATABASE_URL."
    );
  }

  const result = spawnSync(
    process.env.PSQL_PATH ?? "psql",
    [
      "--no-psqlrc",
      "--no-password",
      "--set=ON_ERROR_STOP=1",
      "--tuples-only",
      "--no-align",
      "--quiet",
    ],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        PGHOST: url.hostname.replace(/^\[|\]$/g, ""),
        PGHOSTADDR: "",
        PGPORT: url.port || "5432",
        PGUSER: decodeURIComponent(url.username),
        PGPASSWORD: decodeURIComponent(url.password),
        PGDATABASE: database,
        PGCLIENTENCODING: "UTF8",
        PGCONNECT_TIMEOUT: "5",
      },
      input: sql,
      timeout: 15_000,
    }
  );

  if (result.error) throw result.error;
  expect(result.status, result.stderr).toBe(0);
  return result.stdout.trim();
}

describe.skipIf(!testDatabaseUrl)("public comments migration on disposable PostgreSQL", () => {
  it("enforces the comment constraints and backfills each legacy comment once", () => {
    const migration = readFileSync("prisma/sql/2026-11-23-public-comments.sql", "utf8");

    const outcome = executeSql(
      testDatabaseUrl!,
      `
      BEGIN;
      CREATE SCHEMA blog;
      CREATE SCHEMA info;
      CREATE SCHEMA support;
      CREATE TABLE blog."Blogs" (id integer PRIMARY KEY);
      CREATE TABLE support."Product" ("ProductId" integer PRIMARY KEY);
      CREATE TABLE info."Client" ("UserID" integer PRIMARY KEY);
      CREATE TABLE blog."Comments" (
        id integer PRIMARY KEY,
        blog_id integer NOT NULL REFERENCES blog."Blogs" (id),
        content text NOT NULL,
        created_at varchar(50)
      );
      INSERT INTO blog."Blogs" VALUES (1);
      INSERT INTO support."Product" VALUES (2);
      INSERT INTO info."Client" VALUES (3);
      INSERT INTO blog."Comments" VALUES
        (10, 1, 'متن پیشین', NULL),
        (11, 1, repeat('آ', 2001), 'old date');

      SAVEPOINT before_migration;
      ${migration}
      ${migration}

      CREATE FUNCTION pg_temp.expect_sqlstate(statement text, expected text) RETURNS void
      LANGUAGE plpgsql AS $$
      BEGIN
        EXECUTE statement;
        RAISE EXCEPTION 'Expected SQLSTATE % for %', expected, statement;
      EXCEPTION WHEN OTHERS THEN
        IF SQLSTATE <> expected THEN RAISE; END IF;
      END;
      $$;

      DO $$
      BEGIN
        PERFORM pg_temp.expect_sqlstate(
          $sql$INSERT INTO support."PublicComment" ("displayName", body, presentation)
          VALUES ('Member', 'Body', 'MEMBER')$sql$, '23514');
        PERFORM pg_temp.expect_sqlstate(
          $sql$INSERT INTO support."PublicComment" ("blogId", "productId", "displayName", body, presentation)
          VALUES (1, 2, 'Member', 'Body', 'MEMBER')$sql$, '23514');
        PERFORM pg_temp.expect_sqlstate(
          $sql$INSERT INTO support."PublicComment" ("blogId", "displayName", body, presentation)
          VALUES (900, 'Member', 'Body', 'MEMBER')$sql$, '23503');
        PERFORM pg_temp.expect_sqlstate(
          $sql$INSERT INTO support."PublicComment" ("productId", "displayName", body, presentation)
          VALUES (900, 'Member', 'Body', 'MEMBER')$sql$, '23503');
        PERFORM pg_temp.expect_sqlstate(
          $sql$INSERT INTO support."PublicComment" ("blogId", "actorId", "displayName", body, presentation)
          VALUES (1, 900, 'Member', 'Body', 'MEMBER')$sql$, '23503');
        PERFORM pg_temp.expect_sqlstate(
          $sql$INSERT INTO support."PublicComment" ("blogId", "reviewerId", "displayName", body, presentation)
          VALUES (1, 900, 'Member', 'Body', 'MEMBER')$sql$, '23503');
        PERFORM pg_temp.expect_sqlstate(
          $sql$INSERT INTO support."PublicComment" (id, "parentId", "blogId", "displayName", body, presentation)
          VALUES (900, 900, 1, 'Member', 'Body', 'MEMBER')$sql$, '23514');
        PERFORM pg_temp.expect_sqlstate(
          $sql$INSERT INTO support."PublicComment" ("blogId", "displayName", body, presentation, "legacyBlogCommentId")
          VALUES (1, 'Legacy', 'Body', 'LEGACY', 10)$sql$, '23505');
      END;
      $$;

      SELECT "legacyBlogCommentId", "blogId", status, presentation, "displayName",
        char_length(body), "publishedAt" IS NULL, "actorId" IS NULL
      FROM support."PublicComment" ORDER BY "legacyBlogCommentId";
      SELECT content FROM support."PublicComment" JOIN blog."Comments"
        ON "legacyBlogCommentId" = blog."Comments".id
        WHERE "legacyBlogCommentId" = 10 AND body = content;
      SELECT char_length(content) FROM blog."Comments" WHERE id = 11;
      INSERT INTO support."PublicComment" ("productId", "actorId", "displayName", body, presentation)
      VALUES (2, 3, 'Member', 'Product comment', 'MEMBER') RETURNING status;
      ROLLBACK TO SAVEPOINT before_migration;
      SELECT to_regclass('support."PublicComment"') IS NULL;
      SELECT count(*) FROM blog."Comments";
      ROLLBACK;
    `
    );

    expect(outcome.split(/\r?\n/)).toEqual([
      "10|1|PENDING|LEGACY|کاربر پیشین|9|t|t",
      "11|1|PENDING|LEGACY|کاربر پیشین|2000|t|t",
      "متن پیشین",
      "2001",
      "PENDING",
      "t",
      "2",
    ]);
  });
});
