import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { mockGetMemberPage } = vi.hoisted(() => ({
  mockGetMemberPage: vi.fn(),
}));

vi.mock("@/lib/data/members", () => ({ getMemberPage: mockGetMemberPage }));

vi.mock("@/app/_components/ui/Breadcrumb", () => ({
  default: () => null,
}));

vi.mock("next/image", () => ({
  default: (props: React.ComponentProps<"img">) => <img {...props} alt={props.alt} />,
}));

vi.mock("next/link", () => ({
  default: ({ children, ...props }: React.ComponentProps<"a">) => <a {...props}>{children}</a>,
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

vi.mock("react-icons/fa", () => ({
  FaPhoneAlt: () => null,
  FaWhatsapp: () => null,
}));

describe("MemberPage", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("preserves saved line breaks in the member description", async () => {
    mockGetMemberPage.mockResolvedValue({
      Membersid: 1,
      Name: "Ali",
      Role: "مدیرعامل",
      Slug: "ali",
      main_description: "خط اول\nخط دوم\n\nخط چهارم",
      main_pic: null,
      phonenumber: "09120000000",
    });

    const { default: MemberPage } = await import("../page");
    render(await MemberPage({ params: Promise.resolve({ member: "ali" }) }));

    const description = screen.getByText(
      (_, element) =>
        element?.tagName === "P" && element.textContent === "خط اول\nخط دوم\n\nخط چهارم"
    );
    expect(description).toHaveClass("whitespace-pre-wrap");
  });
});
