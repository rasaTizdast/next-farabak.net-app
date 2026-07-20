import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma, mockS3 } = vi.hoisted(() => ({
  mockPrisma: {
    members: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
  mockS3: {
    putObject: vi.fn().mockReturnValue({ promise: vi.fn().mockResolvedValue({}) }),
    deleteObject: vi.fn().mockReturnValue({ promise: vi.fn().mockResolvedValue({}) }),
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("aws-sdk", () => ({
  S3: vi.fn().mockImplementation(function () { return mockS3; }),
}));

import { PUT } from "../route";

function createFormData(fields: Record<string, string | File | null>): Request {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value instanceof File) {
      fd.append(key, value);
    } else if (value !== null) {
      fd.append(key, value);
    }
  }
  return new Request("http://localhost/api/members/update", {
    method: "PUT",
    body: fd,
  });
}

describe("PUT /api/members/update", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update member without new file", async () => {
    const existing = { Membersid: 1, Name: "Ali", main_pic: "old.png" };
    const updated = { ...existing, Name: "Ali Updated" };
    mockPrisma.members.findUnique.mockResolvedValue(existing);
    mockPrisma.members.update.mockResolvedValue(updated);

    const req = createFormData({
      id: "1",
      name: "Ali Updated",
      role: "Dev",
      desc: "New desc",
      phone: "0912",
      slug: "ali",
      file: null,
    });

    const res = await PUT(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(updated);
  });

  it("should update member with new file and delete old image", async () => {
    const existing = { Membersid: 1, Name: "Ali", main_pic: "old.png" };
    const updated = { ...existing, main_pic: "new.png" };
    mockPrisma.members.findUnique.mockResolvedValue(existing);
    mockPrisma.members.update.mockResolvedValue(updated);

    const file = new File(["content"], "new.png", { type: "image/png" });
    const req = createFormData({
      id: "1",
      name: "Ali",
      role: "Dev",
      desc: "Desc",
      phone: "0912",
      slug: "ali",
      file,
    });

    const res = await PUT(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(mockS3.deleteObject).toHaveBeenCalled();
    expect(mockS3.putObject).toHaveBeenCalled();
  });

  it("should return 400 when id is missing", async () => {
    const req = createFormData({
      name: "Ali",
      role: "Dev",
      desc: "Desc",
      phone: "0912",
      slug: "ali",
      file: null,
    });

    const res = await PUT(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("شناسه عضو الزامی است.");
  });

  it("should return 404 when member not found", async () => {
    mockPrisma.members.findUnique.mockResolvedValue(null);

    const req = createFormData({
      id: "999",
      name: "Ali",
      role: "Dev",
      desc: "Desc",
      phone: "0912",
      slug: "ali",
      file: null,
    });

    const res = await PUT(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("عضو یافت نشد.");
  });

  it("should return 500 on error", async () => {
    mockPrisma.members.findUnique.mockRejectedValue(new Error("DB error"));

    const req = createFormData({
      id: "1",
      name: "Ali",
      role: "Dev",
      desc: "Desc",
      phone: "0912",
      slug: "ali",
      file: null,
    });

    const res = await PUT(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("خطا در به‌روزرسانی عضو.");
  });
});
