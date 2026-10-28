import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: (props: React.ComponentProps<"img">) => <img {...props} alt={props.alt ?? ""} />,
}));

vi.mock("react-icons/bs", () => ({
  BsChevronCompactLeft: () => null,
  BsChevronCompactRight: () => null,
}));

vi.mock("react-icons/rx", () => ({
  RxDotFilled: () => null,
}));

import ProjectSlider from "./ProjectSlider";

const slides = [
  { id: 1, img: "project-1.jpg", alt: "نمای پروژه اول" },
  { id: 2, img: "project-2.jpg", alt: "نمای پروژه دوم" },
];

describe("ProjectSlider", () => {
  it("exposes labelled carousel controls and keyboard navigation", () => {
    render(<ProjectSlider slides={slides} />);

    const region = screen.getByRole("region", { name: "گالری تصاویر پروژه" });
    expect(region).toHaveAttribute("aria-roledescription", "carousel");
    expect(screen.getByRole("button", { name: "اسلاید بعدی" })).toBeVisible();
    expect(screen.getByRole("button", { name: "اسلاید قبلی" })).toBeVisible();

    fireEvent.keyDown(region, { key: "ArrowRight" });
    expect(screen.getByText("اسلاید 2 از 2")).toBeVisible();
  });

  it("pauses autoplay and exposes an empty gallery fallback", () => {
    const { rerender } = render(<ProjectSlider slides={slides} />);
    const pauseButton = screen.getByRole("button", { name: "توقف پخش خودکار" });

    fireEvent.click(pauseButton);
    expect(pauseButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "ادامه پخش خودکار" })).toBeVisible();

    rerender(<ProjectSlider slides={[]} />);
    expect(screen.getByRole("img", { name: "تصویر پروژه موجود نیست" })).toBeVisible();
  });
});
