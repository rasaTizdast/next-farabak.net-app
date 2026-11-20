import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/public/PublicBreadcrumbs", () => ({
  PublicBreadcrumbs: () => <script type="application/ld+json" />,
}));

import ContactUsPage from "./page";

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
    const { container } = render(page.props.children[1].props.fallback);

    expect(container.querySelector('script[type="application/ld+json"]')).toBeNull();
  });
});
