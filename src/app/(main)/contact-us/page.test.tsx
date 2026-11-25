import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getContactInfo } from "@/lib/data/contactUs";

vi.mock("next/cache", () => ({ io: vi.fn() }));
vi.mock("@/lib/data/contactUs", () => ({
  getContactInfo: vi.fn(async () => ({
    address: null,
    emails: [{ address: "contact@example.test" }],
    phone_numbers: [],
  })),
}));

vi.mock("@/components/public/PublicBreadcrumbs", () => ({
  PublicBreadcrumbs: () => <script type="application/ld+json" />,
}));

import ContactUsPage, { ContactUsContent } from "./page";

describe("contact page initial HTML", () => {
  it("renders the page heading outside the loading boundary", () => {
    const page = ContactUsPage();
    const { container } = render(page.props.children[0]);

    expect(container.querySelector("h1")?.textContent).toContain(
      "برای پروژه‌تان از یک گفت‌وگوی دقیق شروع کنید"
    );
  });

  it("does not emit breadcrumb structured data that duplicates the resolved page", () => {
    const page = ContactUsPage();
    const fallback = page.props.children[1].props.fallback;
    const { container } = render(fallback);

    expect(container.querySelector('script[type="application/ld+json"]')).toBeNull();
    expect(
      container.querySelector('[role="status"][aria-label="در حال بارگذاری اطلاعات تماس"]')
    ).not.toBeNull();
    expect(container.querySelector(".skeleton-shimmer.h-72"))?.not.toBeNull();
  });

  it("renders the accessible inquiry form", async () => {
    const page = await ContactUsContent();
    const { getByRole, getByLabelText } = render(page);

    expect(getByRole("form", { name: "فرم درخواست مشاوره" })).toBeInTheDocument();
    expect(getByLabelText("نام و نام خانوادگی")).toBeInTheDocument();
    expect(getByLabelText("شرح نیاز یا پروژه")).toBeInTheDocument();
  });

  it("keeps the inquiry form available when contact details are missing", async () => {
    vi.mocked(getContactInfo).mockResolvedValueOnce({
      address: null,
      emails: [],
      phone_numbers: [],
    });

    const page = await ContactUsContent();
    const { getByRole, getByLabelText } = render(page);

    expect(getByRole("form", { name: "فرم درخواست مشاوره" })).toBeInTheDocument();
    expect(getByLabelText("نام و نام خانوادگی")).toBeInTheDocument();
  });
});
