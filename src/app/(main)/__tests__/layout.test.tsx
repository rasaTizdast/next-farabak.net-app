import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../_components/ui/header/Header", () => ({
  default: () => <header data-testid="header" />,
}));
vi.mock("../_components/ui/footer/Footer", () => ({
  default: () => <footer data-testid="footer" />,
}));
vi.mock("../../_components/ui/BackToTop", () => ({ default: () => null }));
vi.mock("../_components/ui/WhatsAppContactButton", () => ({ default: () => null }));
vi.mock("next/script", () => ({ default: () => null }));

import Layout from "../layout";

describe("public layout", () => {
  it("exposes a stable skip link and main landmark for keyboard users", () => {
    render(
      <Layout>
        <p>محتوای صفحه</p>
      </Layout>
    );

    expect(screen.getByRole("link", { name: "پرش به محتوای اصلی" })).toHaveAttribute(
      "href",
      "#main-content"
    );
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
  });
});
