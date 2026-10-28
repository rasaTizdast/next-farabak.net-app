import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("announces the status by text and keeps the semantic tone visible", () => {
    render(
      <StatusBadge status="success" aria-label="وضعیت فاکتور: پرداخت‌شده">
        پرداخت‌شده
      </StatusBadge>
    );

    const badge = screen.getByRole("status", { name: "وضعیت فاکتور: پرداخت‌شده" });

    expect(badge).toHaveTextContent("پرداخت‌شده");
    expect(badge).toHaveClass("border-emerald-200", "bg-emerald-50", "text-emerald-800");
  });
});
