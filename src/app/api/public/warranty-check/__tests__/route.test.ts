import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    $queryRaw: vi.fn(),
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { POST } from "../route";

function makePostRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/public/warranty-check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const futureDate = new Date("2027-01-01");
const pastDate = new Date("2023-01-01");

const activeWarranty = [
  {
    warrantyid: 1,
    warrantycode: "W-001",
    status: "Active",
    startdate: new Date("2025-01-01"),
    expirydate: futureDate,
    customer_name: "Ali",
    customer_phone: "09120000000",
  },
];

const expiredWarranty = [
  {
    warrantyid: 2,
    warrantycode: "W-002",
    status: "Active",
    startdate: new Date("2022-01-01"),
    expirydate: pastDate,
    customer_name: "Reza",
    customer_phone: "09130000000",
  },
];

const requestedWarranty = [
  {
    warrantyid: 3,
    warrantycode: "W-003",
    status: "Requested",
    startdate: new Date("2025-01-01"),
    expirydate: futureDate,
    customer_name: "Sara",
    customer_phone: "09140000000",
  },
];

describe("POST /api/public/warranty-check", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when warrantycode is empty", async () => {
    const res = await POST(makePostRequest({ warrantycode: "" }));
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBe("کد گارانتی نمی‌تواند خالی باشد");
  });

  it("returns 404 when warranty not found", async () => {
    mockPrisma.$queryRaw.mockResolvedValue([]);

    const res = await POST(makePostRequest({ warrantycode: "INVALID" }));
    expect(res.status).toBe(404);

    const json = await res.json();
    expect(json.error).toBe("کد گارانتی وارد شده معتبر نیست");
  });

  describe("checkOnly mode", () => {
    it("returns active status for valid active warranty", async () => {
      mockPrisma.$queryRaw.mockResolvedValue(activeWarranty);

      const res = await POST(makePostRequest({ warrantycode: "W-001", checkOnly: true }));
      const json = await res.json();

      expect(json.status).toBe("active");
      expect(json.data.isValid).toBe(true);
      expect(json.data.customerName).toBe("Ali");
    });

    it("returns expired status for expired warranty", async () => {
      mockPrisma.$queryRaw.mockResolvedValue(expiredWarranty);

      const res = await POST(makePostRequest({ warrantycode: "W-002", checkOnly: true }));
      const json = await res.json();

      expect(json.status).toBe("expired");
      expect(json.data.isValid).toBe(false);
    });

    it("returns already_requested for Requested status", async () => {
      mockPrisma.$queryRaw.mockResolvedValue(requestedWarranty);

      const res = await POST(makePostRequest({ warrantycode: "W-003", checkOnly: true }));
      const json = await res.json();

      expect(json.status).toBe("already_requested");
      expect(json.message).toBe("این گارانتی قبلاً درخواست بررسی شده است");
    });
  });

  describe("confirm mode", () => {
    it("updates status to Requested for active warranty", async () => {
      mockPrisma.$queryRaw.mockResolvedValueOnce(activeWarranty).mockResolvedValueOnce([]);

      const res = await POST(makePostRequest({ warrantycode: "W-001", confirm: true }));
      const json = await res.json();

      expect(json.status).toBe("success");
      expect(json.data.status).toBe("Requested");
    });

    it("returns expired status for expired warranty on confirm", async () => {
      mockPrisma.$queryRaw.mockResolvedValue(expiredWarranty);

      const res = await POST(makePostRequest({ warrantycode: "W-002", confirm: true }));
      const json = await res.json();

      expect(json.status).toBe("expired");
    });

    it("returns already_requested for already Requested warranty", async () => {
      mockPrisma.$queryRaw.mockResolvedValue(requestedWarranty);

      const res = await POST(makePostRequest({ warrantycode: "W-003", confirm: true }));
      const json = await res.json();

      expect(json.status).toBe("already_requested");
    });
  });

  describe("legacy path (no checkOnly/confirm flags)", () => {
    it("updates active warranty to Requested", async () => {
      mockPrisma.$queryRaw.mockResolvedValueOnce(activeWarranty).mockResolvedValueOnce([]);

      const res = await POST(makePostRequest({ warrantycode: "W-001" }));
      const json = await res.json();

      expect(json.status).toBe("success");
      expect(json.data.status).toBe("Requested");
    });

    it("returns expired for expired warranty", async () => {
      mockPrisma.$queryRaw.mockResolvedValue(expiredWarranty);

      const res = await POST(makePostRequest({ warrantycode: "W-002" }));
      const json = await res.json();

      expect(json.status).toBe("expired");
    });

    it("returns already_requested for Requested warranty", async () => {
      mockPrisma.$queryRaw.mockResolvedValue(requestedWarranty);

      const res = await POST(makePostRequest({ warrantycode: "W-003" }));
      const json = await res.json();

      expect(json.status).toBe("already_requested");
    });
  });

  it("returns 500 on error", async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error("DB error"));

    const res = await POST(makePostRequest({ warrantycode: "W-001" }));
    expect(res.status).toBe(500);
  });
});
