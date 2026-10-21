import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getContactInfo } from "@/lib/data/contactUs";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    address: { findFirst: vi.fn() },
    emails: { findMany: vi.fn() },
    phone_numbers: { findMany: vi.fn() },
  },
}));

describe("getContactInfo", () => {
  beforeEach(() => {
    vi.mocked(prisma.address.findFirst).mockReset();
    vi.mocked(prisma.emails.findMany).mockReset();
    vi.mocked(prisma.phone_numbers.findMany).mockReset();
  });

  it("returns no invented contact details for a Prisma connection error and retries on the next call", async () => {
    vi.mocked(prisma.address.findFirst).mockRejectedValueOnce(
      new Prisma.PrismaClientInitializationError("Can't reach database server", "test", "P1001")
    );
    vi.mocked(prisma.emails.findMany).mockResolvedValue([]);
    vi.mocked(prisma.phone_numbers.findMany).mockResolvedValue([]);

    expect(await getContactInfo()).toEqual({ address: null, emails: [], phone_numbers: [] });

    vi.mocked(prisma.address.findFirst).mockResolvedValueOnce(null);
    vi.mocked(prisma.emails.findMany).mockResolvedValueOnce([
      { id: 1, title: "پشتیبانی", address: "help@example.com" },
      { id: 2, title: "خالی", address: " " },
    ] as never);
    vi.mocked(prisma.phone_numbers.findMany).mockResolvedValueOnce([
      { id: 1, number: "02112345678" },
      { id: 2, number: " " },
    ] as never);

    expect(await getContactInfo()).toMatchObject({
      address: null,
      emails: [{ id: 1, address: "help@example.com" }],
      phone_numbers: [{ id: 1, number: "02112345678" }],
    });
    expect(prisma.address.findFirst).toHaveBeenCalledTimes(2);
  });

  it("does not hide unexpected query errors", async () => {
    vi.mocked(prisma.address.findFirst).mockRejectedValueOnce(new Error("query mapping bug"));
    vi.mocked(prisma.emails.findMany).mockResolvedValue([]);
    vi.mocked(prisma.phone_numbers.findMany).mockResolvedValue([]);

    await expect(getContactInfo()).rejects.toThrow("query mapping bug");
  });

  it("does not hide unrelated Prisma initialization failures", async () => {
    vi.mocked(prisma.address.findFirst).mockRejectedValueOnce(
      new Prisma.PrismaClientInitializationError(
        "Invalid datasource configuration",
        "test",
        "P1012"
      )
    );
    vi.mocked(prisma.emails.findMany).mockResolvedValue([]);
    vi.mocked(prisma.phone_numbers.findMany).mockResolvedValue([]);

    await expect(getContactInfo()).rejects.toThrow("Invalid datasource configuration");
  });
});
