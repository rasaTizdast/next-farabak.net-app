import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/public/PublicBreadcrumbs", () => ({
  PublicBreadcrumbs: () => <script type="application/ld+json" />,
}));

import ContactUsPage from "./page";

describe("contact page loading fallback", () => {
  it("does not emit breadcrumb structured data that duplicates the resolved page", () => {
    const page = ContactUsPage();
    const { container } = render(page.props.fallback);

    expect(container.querySelector('script[type="application/ld+json"]')).toBeNull();
  });
});
