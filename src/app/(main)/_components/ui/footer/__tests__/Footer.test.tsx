import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ io: vi.fn() }));
vi.mock("@/lib/data/contactUs", () => ({
  getContactInfo: vi.fn().mockResolvedValue({ address: null, phone_numbers: [] }),
}));

import Footer from "../Footer";

describe("Footer", () => {
  it("puts footer content on the shared public gutter contract", async () => {
    render(await Footer());

    const content = screen.getByRole("contentinfo").firstElementChild;
    expect(content).toHaveClass(
      "max-w-[1580px]",
      "px-6",
      "md:px-12",
      "min-[992px]:px-16",
      "min-[1200px]:px-24",
      "2xl:px-40"
    );
  });
});
