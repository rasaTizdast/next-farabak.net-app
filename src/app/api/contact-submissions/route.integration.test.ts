// @vitest-environment node

import { randomUUID } from "node:crypto";

import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const { requireAuth } = vi.hoisted(() => ({ requireAuth: vi.fn() }));

vi.mock("@/lib/auth", () => ({ requireAuth }));

import { GET } from "@/app/api/admin/contact-submissions/route";

import { POST } from "./route";

function isLoopbackAppTestDatabase() {
  const testDatabaseUrl = process.env.TEST_DATABASE_URL;
  const appDatabaseUrl = process.env.DATABASE_URL;
  if (!testDatabaseUrl || testDatabaseUrl !== appDatabaseUrl) return false;

  try {
    const url = new URL(testDatabaseUrl);
    return (
      ["postgres:", "postgresql:"].includes(url.protocol) &&
      ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) &&
      /^farabak_app_test_[a-z0-9_]+$/.test(decodeURIComponent(url.pathname.slice(1))) &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
}

const safeTestDatabase = isLoopbackAppTestDatabase();
const database = safeTestDatabase ? new PrismaClient() : null;
const messageMarker = `contact smoke ${randomUUID()}`;
let connected = false;

function getDatabase() {
  if (!database) throw new Error("A loopback farabak_app_test_* database is required.");
  return database;
}

describe.skipIf(!safeTestDatabase)("contact submission route integration", () => {
  beforeAll(async () => {
    await getDatabase().$connect();
    connected = true;
  });

  afterAll(async () => {
    if (!connected) return;
    const db = getDatabase();
    await db.contactSubmission.deleteMany({ where: { message: messageMarker } });
    expect(await db.contactSubmission.count({ where: { message: messageMarker } })).toBe(0);
    await db.$disconnect();
  });

  it("persists a real submission for admins and denies branch access", async () => {
    const response = await POST(
      new Request("http://localhost/api/contact-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Integration Visitor",
          phone: "09121234567",
          project: "Isolated smoke test",
          message: messageMarker,
          website: "",
        }),
      })
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true });
    expect(response.headers.get("cache-control")).toBe("no-store");

    const db = getDatabase();
    const saved = await db.contactSubmission.findFirst({
      where: { message: messageMarker },
      select: { id: true, name: true, phone: true, project: true, message: true },
    });
    if (!saved) throw new Error("The contact submission was not persisted.");
    expect(saved).toEqual({
      id: expect.any(Number),
      name: "Integration Visitor",
      phone: "09121234567",
      project: "Isolated smoke test",
      message: messageMarker,
    });

    requireAuth.mockResolvedValueOnce({ userId: "7", username: "admin", role: "Admin" });
    const adminResponse = await GET(new Request("http://localhost/api/admin/contact-submissions"));
    const adminPayload = (await adminResponse.json()) as {
      items: Array<{ id: number; message: string }>;
    };
    expect(adminResponse.status).toBe(200);
    expect(adminPayload.items).toContainEqual(
      expect.objectContaining({ id: saved.id, message: messageMarker })
    );

    requireAuth.mockResolvedValueOnce({ userId: "8", username: "branch", role: "Branch" });
    const branchResponse = await GET(new Request("http://localhost/api/admin/contact-submissions"));
    expect(branchResponse.status).toBe(403);
  });
});
