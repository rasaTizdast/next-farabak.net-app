import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ResponsiveDataRegion } from "./ResponsiveDataRegion";

describe("ResponsiveDataRegion", () => {
  it("provides a labelled focusable table region and a card representation", () => {
    render(
      <ResponsiveDataRegion
        label="فهرست فاکتورها"
        table={
          <table>
            <caption>فاکتورها</caption>
            <tbody>
              <tr>
                <td>۱۰۰۱</td>
              </tr>
            </tbody>
          </table>
        }
      >
        <article aria-label="فاکتور ۱۰۰۱">نمای کارت فاکتور</article>
      </ResponsiveDataRegion>
    );

    const region = screen.getByRole("region", { name: "فهرست فاکتورها" });

    expect(region).toHaveAttribute("tabindex", "0");
    expect(region).toHaveClass("overflow-x-auto");
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "فاکتور ۱۰۰۱" })).toBeInTheDocument();
  });
});
