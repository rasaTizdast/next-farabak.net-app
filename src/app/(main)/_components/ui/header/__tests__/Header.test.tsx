import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ io: vi.fn() }));
vi.mock("@/helpers/menuHelpers", () => ({ fetchMenuCategories: vi.fn().mockResolvedValue([]) }));
vi.mock("../../hambugerMenu/HamburgerMenu", () => ({ default: () => null }));
vi.mock("../../navbar/Navbar", () => ({ default: () => null }));
vi.mock("../UserStatusIcon", () => ({ default: () => null }));
vi.mock("../../searchBox/SearchBox", () => ({ default: () => null }));
vi.mock("next/image", () => ({ default: () => <span /> }));

import Header from "../Header";

describe("Header", () => {
  it("puts the navigation content on the shared public gutter contract", async () => {
    render(await Header());

    const banner = screen.getByRole("banner");
    expect(banner.firstElementChild).toHaveClass(
      "max-w-[1580px]",
      "px-6",
      "md:px-12",
      "min-[992px]:px-16",
      "min-[1200px]:px-24",
      "2xl:px-40"
    );
  });
});
