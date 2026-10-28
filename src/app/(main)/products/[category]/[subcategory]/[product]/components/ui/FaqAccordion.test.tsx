import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import FaqAccordion from "./FaqAccordion";

describe("FaqAccordion", () => {
  it("connects each question to an answer region and reveals it on activation", () => {
    render(
      <FaqAccordion
        faqs={[{ FAQsId: 1, Title: "آیا نصب هم انجام می‌شود؟", Description: "بله، با هماهنگی." }]}
      />
    );

    const button = screen.getByRole("button", { name: "آیا نصب هم انجام می‌شود؟" });
    expect(button).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(button);

    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: "آیا نصب هم انجام می‌شود؟" })).toHaveTextContent(
      "بله، با هماهنگی."
    );
  });
});
