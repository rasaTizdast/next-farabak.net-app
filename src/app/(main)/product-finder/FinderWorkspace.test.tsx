import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import FinderWorkspace from "./FinderWorkspace";

describe("FinderWorkspace", () => {
  it("shows the next hard-coded question after an answer without fetching", async () => {
    render(
      <FinderWorkspace
        category={{ name: "رئولینک", slug: "reolink-cctv-camera" }}
        products={[
          {
            productId: 1,
            categorySlug: "reolink-cctv-camera",
            subcategorySlug: null,
            name: "Duo",
            model: null,
            sourceText: "Duo",
            imageUrl: null,
            detailHref: "/products/reolink-cctv-camera",
            specs: [],
          },
        ]}
      />
    );

    expect(screen.getByRole("heading", { name: "دوربین کجا نصب می‌شود؟" })).toBeVisible();
  });

  it("does not start a misleading flow when the category has no active products", () => {
    render(
      <FinderWorkspace category={{ name: "سالن کنفرانس", slug: "conference-hall" }} products={[]} />
    );

    expect(screen.getByRole("heading", { name: "محصول فعالی برای این نیاز نداریم" })).toBeVisible();
  });
});
