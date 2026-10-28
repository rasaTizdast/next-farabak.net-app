import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageIntro } from "./PageIntro";

describe("PageIntro", () => {
  it("keeps the page title in a semantic heading and exposes supporting copy", () => {
    render(
      <PageIntro
        eyebrow="راهنمای خرید"
        title="تجهیزات تصویربرداری"
        description="انتخاب دقیق برای پروژه شما."
      />
    );

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "تجهیزات تصویربرداری" })).toBeVisible();
    expect(screen.getByText("راهنمای خرید")).toBeVisible();
    expect(screen.getByText("انتخاب دقیق برای پروژه شما.")).toBeVisible();
  });
});
