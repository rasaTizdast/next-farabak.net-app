import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProductBlogStep } from "../newProductModal/steps/ProductBlogStep";

const { setProductBlog } = vi.hoisted(() => ({ setProductBlog: vi.fn() }));
vi.mock("../newProductModal/NewProductWizardContext", () => ({
  useNewProductWizard: () => ({
    state: { slug: "qa-product", productBlog: "<p>Saved draft</p>" },
    actions: { setProductBlog, toggleSection: vi.fn() },
    openSections: { productBlog: true },
  }),
}));
vi.mock("@/components/editor/TipTapEditor", () => ({
  TipTapEditor: ({ content, onChange }: { content: string; onChange: (value: string) => void }) => (
    <textarea
      aria-label="Product article"
      value={content}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

describe("product article draft", () => {
  beforeEach(() => vi.clearAllMocks());

  it("restores the saved draft when the article step mounts", () => {
    render(<ProductBlogStep />);
    expect(screen.getByRole("textbox", { name: "Product article" })).toHaveValue(
      "<p>Saved draft</p>"
    );
  });

  it("keeps the latest edit ready for an immediate form submission", () => {
    render(<ProductBlogStep />);
    fireEvent.change(screen.getByRole("textbox", { name: "Product article" }), {
      target: { value: "<p>Latest draft</p>" },
    });
    expect(setProductBlog).toHaveBeenCalledWith("<p>Latest draft</p>");
  });
});
