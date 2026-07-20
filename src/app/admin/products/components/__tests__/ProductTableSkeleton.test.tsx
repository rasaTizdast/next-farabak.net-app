import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProductTableSkeleton from "../ProductTableSkeleton";

describe("ProductTableSkeleton", () => {
  it("renders a table row with skeleton cells", () => {
    const { container } = render(
      <table>
        <tbody>
          <ProductTableSkeleton />
        </tbody>
      </table>
    );
    const row = container.querySelector("tr");
    expect(row).toBeInTheDocument();
    expect(row).toHaveClass("animate-pulse");
  });

  it("renders 8 skeleton cells", () => {
    const { container } = render(
      <table>
        <tbody>
          <ProductTableSkeleton />
        </tbody>
      </table>
    );
    const cells = container.querySelectorAll("td");
    expect(cells).toHaveLength(8);
  });

  it("each cell contains a skeleton bar", () => {
    const { container } = render(
      <table>
        <tbody>
          <ProductTableSkeleton />
        </tbody>
      </table>
    );
    const skeletonBars = container.querySelectorAll(".h-4.w-full.rounded.bg-slate-700");
    expect(skeletonBars).toHaveLength(8);
  });

  it("row has bg-slate-800 background", () => {
    const { container } = render(
      <table>
        <tbody>
          <ProductTableSkeleton />
        </tbody>
      </table>
    );
    const row = container.querySelector("tr");
    expect(row).toHaveClass("bg-slate-800");
  });
});
