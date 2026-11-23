// @vitest-environment node

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const databaseNames = /^farabak_comments_test_[a-z0-9_]+$/;
const testDb = vi.hoisted(() => ({ client: undefined as PrismaClient | undefined }));

vi.mock("@/lib/prisma", () => ({ prisma: testDb.client }));

function getIsolatedDatabaseUrl(connection: string) {
  const url = new URL(connection);
  const database = url.pathname.slice(1);
  const appDatabase = process.env.DATABASE_URL && new URL(process.env.DATABASE_URL);

  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
    !databaseNames.test(database) ||
    url.search ||
    url.hash ||
    (appDatabase && decodeURIComponent(appDatabase.pathname.slice(1)) === database)
  ) {
    throw new Error(
      "TEST_DATABASE_URL must identify a dedicated loopback farabak_comments_test_* database."
    );
  }

  return url;
}

function executeSql(url: URL, sql: string) {
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
      env: {
        ...process.env,
        PGHOST: url.hostname.replace(/^\[|\]$/g, ""),
        PGHOSTADDR: "",
        PGPORT: url.port || "5432",
        PGUSER: decodeURIComponent(url.username),
        PGPASSWORD: decodeURIComponent(url.password),
        PGDATABASE: url.pathname.slice(1),
        PGCLIENTENCODING: "UTF8",
        PGCONNECT_TIMEOUT: "5",
      },
      input: sql,
      encoding: "utf8",
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
      getIsolatedDatabaseUrl(testDatabaseUrl!),
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

const target = { type: "blog", id: 7 } as const;
const submission = { target, mode: "member", body: "پرسش درباره نصب" } as const;

describe.skipIf(!testDatabaseUrl)("public comments on disposable PostgreSQL", () => {
  let db: PrismaClient;
  let url: URL;
  let fixtureInstalled = false;
  let service: typeof import("./service");
  let queries: typeof import("./queries");

  beforeAll(async () => {
    url = getIsolatedDatabaseUrl(testDatabaseUrl!);
    executeSql(
      url,
      `
      BEGIN;
      CREATE SCHEMA blog;
      CREATE SCHEMA info;
      CREATE SCHEMA support;
      CREATE TABLE blog."Blogs" (id integer PRIMARY KEY, status text, "QrCode_key" text);
      CREATE TABLE support."Product" ("ProductId" integer PRIMARY KEY, "Available" boolean, "QrCode_Key" text);
      CREATE TABLE info."Client" ("UserID" integer PRIMARY KEY, "FirstName" text, "LastName" text, "Role" text);
      CREATE TABLE blog."Comments" (id integer PRIMARY KEY, blog_id integer, content text);
      INSERT INTO blog."Blogs" VALUES (7, 'Published', NULL), (8, 'Published', NULL), (9, 'Published', NULL);
      INSERT INTO support."Product" VALUES (7, true, NULL);
      INSERT INTO info."Client" VALUES (18, 'علی', 'رضایی', 'Public'), (19, NULL, NULL, 'Admin');
      ${readFileSync("prisma/sql/2026-11-23-public-comments.sql", "utf8")}
      COMMIT;
    `
    );
    fixtureInstalled = true;
    db = new PrismaClient({ datasourceUrl: url.toString() });
    testDb.client = db;
    service = await import("./service");
    queries = await import("./queries");
  }, 20_000);

  afterAll(async () => {
    await db?.$disconnect();
    if (fixtureInstalled) executeSql(url, "DROP SCHEMA support, blog, info CASCADE;");
  }, 20_000);

  it("allows only one of two simultaneous submissions when an account already has four", async () => {
    for (let seeded = 0; seeded < 4; seeded += 1) await service.submitComment(submission, 18);

    const results = await Promise.allSettled([
      service.submitComment(submission, 18),
      service.submitComment({ ...submission, target: { type: "product", id: 7 } }, 18),
    ]);
    expect(results).toEqual(
      expect.arrayContaining([
        { status: "fulfilled", value: { id: expect.any(Number), status: "PENDING" } },
        { status: "rejected", reason: expect.objectContaining({ status: 429 }) },
      ])
    );
    expect(await db.publicComment.count({ where: { actorId: 18 } })).toBe(5);
  });

  it("keeps editorial replies hidden when a parent hide races reply submission", async () => {
    const parent = await db.publicComment.create({
      data: {
        blogId: 8,
        body: "پرسش مورد تایید",
        displayName: "علی رضایی",
        presentation: "MEMBER",
        status: "APPROVED",
        publishedAt: new Date(),
      },
    });
    const replyInput = {
      target: { type: "blog", id: 8 },
      body: "پاسخ تیم به پرسش",
      mode: "editorial",
      parentId: parent.id,
    } as const;
    const existing = await service.submitComment(replyInput, 19);
    await service.moderateComment(existing.id, "APPROVED", 19);
    await expect(queries.listApprovedComments(replyInput.target)).resolves.toMatchObject({
      comments: [{ id: parent.id, replies: [{ id: existing.id }] }],
    });

    const [replyResult, hideResult] = await Promise.allSettled([
      service.submitComment(replyInput, 19),
      service.moderateComment(parent.id, "REJECTED", 19, "دلیل پنهان کردن"),
    ]);
    expect(hideResult.status).toBe("fulfilled");
    if (replyResult.status === "fulfilled") {
      await expect(
        service.moderateComment(replyResult.value.id, "APPROVED", 19)
      ).rejects.toMatchObject({
        code: "PARENT_NOT_APPROVED",
      });
      await expect(
        db.publicComment.findUnique({ where: { id: replyResult.value.id } })
      ).resolves.toMatchObject({
        status: "PENDING",
        parentId: parent.id,
        blogId: 8,
      });
    } else {
      expect(replyResult.reason).toMatchObject({ code: "PARENT_NOT_APPROVED" });
    }
    await expect(queries.listApprovedComments(replyInput.target)).resolves.toEqual({
      comments: [],
      nextCursor: null,
    });
  });

  it("paginates tied timestamps by ID without returning private rows or leaking audit fields", async () => {
    const tiedAt = new Date("2026-11-23T10:00:00Z");
    const approved = await db.publicComment.createManyAndReturn({
      data: Array.from({ length: 22 }, () => ({
        blogId: 9,
        actorId: 18,
        reviewerId: 19,
        reviewNote: "internal audit note",
        displayName: "علی رضایی",
        body: "پرسش مورد تایید",
        presentation: "MEMBER",
        status: "APPROVED",
        createdAt: tiedAt,
        publishedAt: tiedAt,
      })),
      select: { id: true },
    });
    const pending = await db.publicComment.create({
      data: {
        blogId: 9,
        displayName: "کاربر",
        body: "متن در انتظار تایید",
        presentation: "MEMBER",
      },
    });
    const paginationTarget = { type: "blog", id: 9 } as const;
    const sortedIds = approved.map((row) => row.id).sort((a, b) => b - a);

    const page = await queries.listApprovedComments(paginationTarget);
    expect(page.comments.map((row) => row.id)).toEqual(sortedIds.slice(0, 20));
    expect(page.nextCursor).toBe(sortedIds[19]);
    expect(page.comments[0]).toEqual({
      id: sortedIds[0],
      displayName: "علی رضایی",
      body: "پرسش مورد تایید",
      presentation: "MEMBER",
      publishedAt: "2026-11-23T10:00:00.000Z",
      replies: [],
    });

    const lastPage = await queries.listApprovedComments(paginationTarget, page.nextCursor!);
    expect(lastPage.comments.map((row) => row.id)).toEqual(sortedIds.slice(20));
    expect(lastPage.nextCursor).toBeNull();

    await expect(queries.listApprovedComments(paginationTarget, pending.id)).rejects.toMatchObject({
      status: 400,
    });
    await db.blogs.update({
      where: { id: 9 },
      data: { QrCode_key: "private" },
      select: { id: true },
    });
    await expect(queries.listApprovedComments(paginationTarget)).rejects.toMatchObject({
      status: 404,
    });
  });
});
