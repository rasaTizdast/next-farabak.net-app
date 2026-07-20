import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BlogFaqAccordion from "../BlogFaqAccordion";

const mockFaqs = [
  { id: 1, question: "Blog question 1?", answer: "Blog answer 1.", order: 1 },
  { id: 2, question: "Blog question 2?", answer: "Blog answer 2.", order: 2 },
];

describe("BlogFaqAccordion", () => {
  it("renders FAQ questions", () => {
    render(
      <BlogFaqAccordion faqs={mockFaqs} blogTitle="Test Blog" blogSlug="test-blog" />
    );
    expect(screen.getByText("Blog question 1?")).toBeDefined();
    expect(screen.getByText("Blog question 2?")).toBeDefined();
  });

  it("shows answer when clicked", () => {
    render(
      <BlogFaqAccordion faqs={mockFaqs} blogTitle="Test Blog" blogSlug="test-blog" />
    );
    fireEvent.click(screen.getByText("Blog question 1?"));
    expect(screen.getByText("Blog answer 1.")).toBeDefined();
  });

  it("hides answer when clicked again", () => {
    render(
      <BlogFaqAccordion faqs={mockFaqs} blogTitle="Test Blog" blogSlug="test-blog" />
    );
    fireEvent.click(screen.getByText("Blog question 1?"));
    expect(screen.getByText("Blog answer 1.")).toBeDefined();
    fireEvent.click(screen.getByText("Blog question 1?"));
    expect(screen.queryByText("Blog answer 1.")).toBeNull();
  });

  it("renders nothing when no FAQs", () => {
    const { container } = render(
      <BlogFaqAccordion faqs={[]} blogTitle="Test Blog" blogSlug="test-blog" />
    );
    expect(container.innerHTML).toBe("");
  });
});
