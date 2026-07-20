import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    master_activity: {
      findMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    details_activity: {
      deleteMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET, PUT } from "../route";

function makePutRequest(body: unknown) {
  return new Request("http://localhost/api/activities", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/activities", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns all master activities with details", async () => {
    const mockActivities = [
      {
        id: 1,
        title: "Activity 1",
        Details_activity: [{ id: 1, activityID: 1, description: "Detail 1" }],
      },
    ];
    mockPrisma.master_activity.findMany.mockResolvedValue(mockActivities);

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toEqual(mockActivities);
    expect(mockPrisma.master_activity.findMany).toHaveBeenCalledWith({
      include: { Details_activity: true },
    });
  });

  it("returns empty array when no activities exist", async () => {
    mockPrisma.master_activity.findMany.mockResolvedValue([]);

    const res = await GET();
    const json = await res.json();
    expect(json).toEqual([]);
  });
});

describe("PUT /api/activities", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates existing activities and their details", async () => {
    mockPrisma.master_activity.findMany.mockResolvedValue([
      { id: 1, title: "Old Title", Details_activity: [{ id: 10, activityID: 1, description: "Old" }] },
    ]);
    mockPrisma.master_activity.update.mockResolvedValue({ id: 1, title: "New Title" });
    mockPrisma.details_activity.update.mockResolvedValue({});

    const res = await PUT(
      makePutRequest([
        { id: 1, title: "New Title", Details_activity: [{ id: 10, description: "New" }] },
      ])
    );

    expect(res.status).toBe(200);
    expect(mockPrisma.master_activity.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { title: "New Title" },
    });
  });

  it("creates new activities without id", async () => {
    mockPrisma.master_activity.findMany.mockResolvedValue([]);
    mockPrisma.master_activity.create.mockResolvedValue({ id: 2, title: "New" });
    mockPrisma.details_activity.create.mockResolvedValue({});

    const res = await PUT(
      makePutRequest([
        { id: 0, title: "New", Details_activity: [{ description: "Detail" }] },
      ])
    );

    expect(res.status).toBe(200);
    expect(mockPrisma.master_activity.create).toHaveBeenCalled();
  });

  it("deletes activities removed from frontend", async () => {
    mockPrisma.master_activity.findMany.mockResolvedValue([
      { id: 99, title: "Deleted", Details_activity: [] },
    ]);
    mockPrisma.details_activity.deleteMany.mockResolvedValue({});
    mockPrisma.master_activity.delete.mockResolvedValue({});

    const res = await PUT(makePutRequest([]));

    expect(res.status).toBe(200);
    expect(mockPrisma.master_activity.delete).toHaveBeenCalledWith({ where: { id: 99 } });
    expect(mockPrisma.details_activity.deleteMany).toHaveBeenCalledWith({
      where: { activityID: 99 },
    });
  });

  it("returns 500 on error", async () => {
    mockPrisma.master_activity.findMany.mockRejectedValue(new Error("DB error"));

    const res = await PUT(makePutRequest([]));
    expect(res.status).toBe(500);
  });
});
