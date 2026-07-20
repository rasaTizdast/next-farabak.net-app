import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma, mockS3Instance } = vi.hoisted(() => {
  const instance = {
    deleteObject: vi.fn().mockReturnValue({ promise: vi.fn().mockResolvedValue({}) }),
  };
  return {
    mockPrisma: {
      sliders: {
        findFirst: vi.fn(),
        delete: vi.fn(),
      },
    },
    mockS3Instance: instance,
  };
});

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("aws-sdk", () => ({
  S3: class {
    constructor() {}
    deleteObject(...args: any[]) {
      return mockS3Instance.deleteObject(...args);
    }
  },
}));

import { DELETE } from "../route";

describe("DELETE /api/landingPage/sliders/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete a slider and its S3 image", async () => {
    const slider = { id: 1, image_URL: "test-image.jpg" };
    mockPrisma.sliders.findFirst.mockResolvedValue(slider);
    mockPrisma.sliders.delete.mockResolvedValue(slider);

    const req = new Request("http://localhost/api/landingPage/sliders/1", { method: "DELETE" });
    const res = await DELETE(req as any, { params: Promise.resolve({ id: "1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toContain("موفقیت");
    expect(mockPrisma.sliders.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(mockS3Instance.deleteObject).toHaveBeenCalled();
  });

  it("should delete slider without S3 image", async () => {
    const slider = { id: 2, image_URL: null };
    mockPrisma.sliders.findFirst.mockResolvedValue(slider);
    mockPrisma.sliders.delete.mockResolvedValue(slider);

    const req = new Request("http://localhost/api/landingPage/sliders/2", { method: "DELETE" });
    const res = await DELETE(req as any, { params: Promise.resolve({ id: "2" }) });

    expect(res.status).toBe(200);
    expect(mockS3Instance.deleteObject).not.toHaveBeenCalled();
  });

  it("should return 500 on error", async () => {
    mockPrisma.sliders.findFirst.mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/landingPage/sliders/1", { method: "DELETE" });
    const res = await DELETE(req as any, { params: Promise.resolve({ id: "1" }) });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toContain("خطا");
  });
});
