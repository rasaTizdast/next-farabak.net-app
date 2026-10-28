import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import FaqAccordion from "./FaqAccordion";

describe("FaqAccordion", () => {
  it("exposes keyboard-native disclosure semantics", () => {
    render(
      <FaqAccordion
        faqs={[
          { FaqDetailsid: 12, Q: "چطور سفارش را پیگیری کنم؟", A: "از صفحه پیگیری استفاده کنید." },
        ]}
      />
    );

    const question = screen.getByRole("button", { name: "چطور سفارش را پیگیری کنم؟" });
    expect(question).toHaveAttribute("aria-expanded", "false");
    expect(question).toHaveAttribute("aria-controls", "faq-answer-12");

    fireEvent.click(question);

    const answer = screen.getByRole("region", { name: "چطور سفارش را پیگیری کنم؟" });
    expect(question).toHaveAttribute("aria-expanded", "true");
    expect(answer).toHaveTextContent("از صفحه پیگیری استفاده کنید.");
  });
});
