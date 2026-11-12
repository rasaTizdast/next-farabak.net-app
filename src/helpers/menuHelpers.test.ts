import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchMenuCategories } from "@/helpers/menuHelpers";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: { category: { findMany: vi.fn() } },
}));

describe("fetchMenuCategories", () => {
  beforeEach(() => {
    vi.mocked(prisma.category.findMany).mockReset();
  });

  it("serves an empty menu for a connection failure and retries on the next call", async () => {
    vi.mocked(prisma.category.findMany).mockRejectedValueOnce(
      new Prisma.PrismaClientInitializationError("Can't reach database server", "test", "P1001")
    );
    expect(await fetchMenuCategories()).toEqual([]);

    vi.mocked(prisma.category.findMany).mockResolvedValueOnce([]);
    expect(await fetchMenuCategories()).toEqual([]);
    expect(prisma.category.findMany).toHaveBeenCalledTimes(2);
  });

  it("surfaces an unexpected query error", async () => {
    vi.mocked(prisma.category.findMany).mockRejectedValueOnce(new Error("invalid category query"));
    await expect(fetchMenuCategories()).rejects.toThrow("invalid category query");
  });
});
