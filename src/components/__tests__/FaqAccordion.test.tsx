import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import FaqAccordion from "../FaqAccordion";

const mockFaqs = [
  { FaqDetailsid: 1, Q: "What is this?", A: "It is a test FAQ." },
  { FaqDetailsid: 2, Q: "How does it work?", A: "Like this." },
  { FaqDetailsid: 3, Q: "Is it free?", A: "Yes, it is free." },
];

describe("FaqAccordion", () => {
  it("renders empty state when no FAQs", () => {
    render(<FaqAccordion faqs={[]} />);
    expect(screen.getByText(/پرسش و پاسخی موجود نیست/)).toBeDefined();
  });

  it("renders FAQ questions", () => {
    render(<FaqAccordion faqs={mockFaqs} />);
    expect(screen.getByText("What is this?")).toBeDefined();
    expect(screen.getByText("How does it work?")).toBeDefined();
    expect(screen.getByText("Is it free?")).toBeDefined();
  });

  it("shows answer when FAQ is clicked", () => {
    render(<FaqAccordion faqs={mockFaqs} />);
    const question = screen.getByRole("button", { name: "What is this?" });
    expect(question).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("It is a test FAQ.")).not.toBeVisible();

    fireEvent.click(question);

    const panel = screen.getByRole("region", { name: "What is this?" });
    expect(question).toHaveAttribute("aria-expanded", "true");
    expect(panel).toBeVisible();
    expect(panel).toHaveTextContent("It is a test FAQ.");
  });

  it("hides answer when FAQ is clicked again", () => {
    render(<FaqAccordion faqs={mockFaqs} />);
    const question = screen.getByRole("button", { name: "What is this?" });
    fireEvent.click(question);
    const panel = screen.getByRole("region", { name: "What is this?" });

    fireEvent.click(question);

    expect(question).toHaveAttribute("aria-expanded", "false");
    expect(panel).toHaveAttribute("hidden");
    expect(panel).not.toBeVisible();
  });

  it("filters FAQs based on search query", () => {
    render(<FaqAccordion faqs={mockFaqs} />);
    const searchInput = screen.getByPlaceholderText(/جستجو/);
    fireEvent.change(searchInput, { target: { value: "free" } });
    expect(screen.getByText("Is it free?")).toBeDefined();
    expect(screen.queryByText("What is this?")).toBeNull();
  });

  it("shows no results message when search has no matches", () => {
    render(<FaqAccordion faqs={mockFaqs} />);
    const searchInput = screen.getByPlaceholderText(/جستجو/);
    fireEvent.change(searchInput, { target: { value: "xyznonexistent" } });
    expect(screen.getByText(/هیچ نتیجه‌ای/)).toBeDefined();
  });

  it("shows default question text when Q is empty", () => {
    const faqs = [{ FaqDetailsid: 1, Q: "", A: "Answer" }];
    render(<FaqAccordion faqs={faqs} />);
    expect(screen.getByText("سوال بدون عنوان")).toBeDefined();
  });

  it("shows default answer text when A is empty", () => {
    const faqs = [{ FaqDetailsid: 1, Q: "Question", A: "" }];
    render(<FaqAccordion faqs={faqs} />);
    fireEvent.click(screen.getByText("Question"));
    expect(screen.getByText("پاسخی ثبت نشده است.")).toBeDefined();
  });
});
