import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OperationsPageHeader } from "./OperationsPageHeader";

describe("OperationsPageHeader", () => {
  it("renders an operations banner with one level-one heading and actions", () => {
    render(
      <OperationsPageHeader
        eyebrow="مدیریت سفارش‌ها"
        title="فاکتورها"
        description="فهرست فاکتورهای ثبت‌شده"
        actions={<button type="button">فاکتور جدید</button>}
      />
    );

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "فاکتورها" })).toBeVisible();
    expect(screen.getByRole("button", { name: "فاکتور جدید" })).toBeVisible();
  });
});
