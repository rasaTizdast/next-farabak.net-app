import { beforeEach, describe, expect, it, vi } from "vitest";

const { getProjectDataMock } = vi.hoisted(() => ({
  getProjectDataMock: vi.fn(),
}));

vi.mock("@/lib/data/projects", () => ({ getProjectData: getProjectDataMock }));

import { generateMetadata } from "./page";

describe("project page metadata", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://farabak.net");
    getProjectDataMock.mockResolvedValue({
      id: 1,
      title: "Charmshahr CCTV installation",
      date: "2026-01-01",
      images: [],
      largeDesc: "Project description",
      location: "Tehran",
      video: undefined,
    });
  });

  it("declares the active project's own canonical URL", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ project: "charmshahr" }),
    });

    expect(metadata.alternates?.canonical).toBe("https://farabak.net/about-us/projects/charmshahr");
  });
});
