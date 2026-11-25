import { beforeEach, describe, expect, it, vi } from "vitest";

const { create } = vi.hoisted(() => ({ create: vi.fn() }));

vi.mock("@/lib/prisma", () => ({
  prisma: { contactSubmission: { create } },
}));

import { POST } from "./route";

const validSubmission = {
  name: " علی رضایی ",
  phone: "۰۹۱۲-۱۲۳ ۴۵۶۷",
  project: " دوربین مداربسته ",
  message: " برای خانه به مشاوره انتخاب دوربین نیاز دارم. ",
  website: "",
};

function makeRequest(body: string) {
  return new Request("http://localhost/api/contact-submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

describe("POST /api/contact-submissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    create.mockResolvedValue({ id: 21 });
  });

  it("stores trimmed fields with Persian phone digits normalized and returns no personal data", async () => {
    const response = await POST(makeRequest(JSON.stringify(validSubmission)));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true });
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(create).toHaveBeenCalledWith({
      data: {
        name: "علی رضایی",
        phone: "09121234567",
        project: "دوربین مداربسته",
        message: "برای خانه به مشاوره انتخاب دوربین نیاز دارم.",
      },
    });
  });

  it.each([
    ["short name", { ...validSubmission, name: "ع" }],
    ["invalid phone", { ...validSubmission, phone: "تماس بگیرید" }],
    ["short message", { ...validSubmission, message: "سلام" }],
    ["long project", { ...validSubmission, project: "پ".repeat(161) }],
    ["unknown data", { ...validSubmission, email: "visitor@example.test" }],
  ])("rejects %s without writing a submission", async (_case, data) => {
    const response = await POST(makeRequest(JSON.stringify(data)));

    expect(response.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON", async () => {
    const response = await POST(makeRequest("{"));

    expect(response.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects a request body above 24,576 bytes before parsing it", async () => {
    const response = await POST(makeRequest(JSON.stringify({ message: "x".repeat(24_577) })));

    expect(response.status).toBe(413);
    expect(create).not.toHaveBeenCalled();
  });

  it("silently acknowledges a filled honeypot without saving it", async () => {
    const response = await POST(
      makeRequest(JSON.stringify({ ...validSubmission, website: "https://spam.example" }))
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true });
    expect(create).not.toHaveBeenCalled();
  });

  it("returns a generic error when persistence fails without echoing submitted details", async () => {
    create.mockRejectedValue(new Error("database contains private details"));
    const response = await POST(makeRequest(JSON.stringify(validSubmission)));
    const responseText = await response.text();

    expect(response.status).toBe(500);
    expect(responseText).not.toContain(validSubmission.name);
    expect(responseText).not.toContain("database contains private details");
  });
});
