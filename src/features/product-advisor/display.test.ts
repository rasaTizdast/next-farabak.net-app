import { describe, expect, it } from "vitest";

import { shouldShowAdvisorModel } from "./display";

describe("shouldShowAdvisorModel", () => {
  it("hides a model when it repeats the product name", () => {
    expect(shouldShowAdvisorModel("Duo", "Duo")).toBe(false);
  });

  it("shows a distinct model", () => {
    expect(shouldShowAdvisorModel("دوربین فضای باز", "RLC-OUT")).toBe(true);
  });
});
