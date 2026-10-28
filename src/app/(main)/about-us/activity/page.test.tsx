import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { mockGetActivities } = vi.hoisted(() => ({
  mockGetActivities: vi.fn(),
}));

vi.mock("@/lib/data/activities", () => ({ getActivities: mockGetActivities }));

vi.mock("next/image", () => ({
  default: (props: React.ComponentProps<"img">) => <img {...props} alt={props.alt} />,
}));

describe("ActivityPage", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows the supplied company certificates after the activity content", async () => {
    mockGetActivities.mockResolvedValue([
      {
        id: 1,
        title: "تجهیزات نظارتی",
        Details_activity: [{ id: 1, activityID: 1, description: "طراحی سامانه‌های نظارتی" }],
      },
    ]);

    const { default: ActivityPage } = await import("./page");
    render(await ActivityPage());

    expect(screen.getByRole("heading", { name: "گواهی‌نامه‌ها و افتخارات" })).toBeInTheDocument();
    expect(screen.getByAltText("مجموعه گواهی‌نامه‌ها و افتخارات شرکت فرابک")).toHaveAttribute(
      "src",
      "/about-us/certificates/company-certificates.jpeg"
    );
    expect(
      screen.getByAltText("گواهی ثبت کیفیت شرکت فرابهکاران تصویر هفتم (فرابک)")
    ).toHaveAttribute("src", "/about-us/certificates/quality-registration-certificate.jpeg");
    expect(
      screen
        .getByText("طراحی سامانه‌های نظارتی")
        .compareDocumentPosition(screen.getByRole("heading", { name: "گواهی‌نامه‌ها و افتخارات" }))
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});
