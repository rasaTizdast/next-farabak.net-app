import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Category } from "../../types/types";
import CategoryRow from "../CategoryRow";

const category: Category = {
  CategoryID: 1,
  Name: "Test category",
  Available: true,
  Slug: "test-category",
  Link: "/products/test-category",
  Subcategories: [],
  SEO_Details: { SEO_Title: "Test", SEO_Description: "Description", SEO_Keywords: [] },
};

describe("CategoryRow", () => {
  it("uses a single safe link for the public category page", () => {
    render(
      <table>
        <tbody>
          <CategoryRow
            category={category}
            onDeleteClick={vi.fn()}
            onEditClick={vi.fn()}
            onToggleExpand={vi.fn()}
            expandedCategories={new Set()}
            index={0}
          />
        </tbody>
      </table>
    );

    const link = screen.getByRole("link", { name: "مشاهده" });
    expect(link).toHaveAttribute("href", "/products/test-category");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link.querySelector("button")).toBeNull();
  });
});
