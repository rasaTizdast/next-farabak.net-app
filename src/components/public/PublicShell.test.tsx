import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PublicShell } from "./PublicShell";

describe("PublicShell", () => {
  it("renders a labelled RTL landmark on the shared public reading grid", () => {
    render(
      <PublicShell as="main" aria-label="صفحه عمومی">
        <p>محتوای صفحه</p>
      </PublicShell>
    );

    const shell = screen.getByRole("main", { name: "صفحه عمومی" });

    expect(shell).toHaveAttribute("dir", "rtl");
    expect(shell).toHaveClass(
      "max-w-[1580px]",
      "px-6",
      "md:px-12",
      "min-[992px]:px-16",
      "min-[1200px]:px-24",
      "2xl:px-40"
    );
  });
});
