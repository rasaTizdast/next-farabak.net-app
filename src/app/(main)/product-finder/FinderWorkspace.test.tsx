import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import FinderWorkspace from "./FinderWorkspace";

describe("FinderWorkspace", () => {
  it("shows the next hard-coded question after an answer without fetching", async () => {
    render(
      <FinderWorkspace category={{ name: "رئولینک", slug: "reolink-cctv-camera" }} products={[]} />
    );

    expect(screen.getByRole("heading", { name: "دوربین کجا نصب می‌شود؟" })).toBeVisible();
  });
});
