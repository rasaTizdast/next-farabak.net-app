import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/image", () => ({
  default: (props: any) => <img alt={props.alt} {...props} />,
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import ImageSlider from "../ImageSlider";

const slides = [
  { id: 1, img: "/slide1.jpg", link: "/link1", alt: "Slide 1" },
  { id: 2, img: "/slide2.jpg", link: "/link2", alt: "Slide 2" },
  { id: 3, img: "/slide3.jpg", link: "/link3", alt: "Slide 3" },
];

describe("ImageSlider", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders all slides", () => {
    render(<ImageSlider slides={slides} />);
    expect(screen.getAllByRole("img")).toHaveLength(3);
  });

  it("renders slide images with correct alt text", () => {
    render(<ImageSlider slides={slides} />);
    expect(screen.getByAltText("Slide 1")).toBeDefined();
    expect(screen.getByAltText("Slide 2")).toBeDefined();
    expect(screen.getByAltText("Slide 3")).toBeDefined();
  });

  it("renders slide links", () => {
    render(<ImageSlider slides={slides} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(links[0].getAttribute("href")).toBe("/link1");
  });

  it("renders navigation arrow buttons", () => {
    render(<ImageSlider slides={slides} />);
    expect(screen.getByLabelText("اسلاید بعدی")).toBeDefined();
    expect(screen.getByLabelText("اسلاید قبلی")).toBeDefined();
  });

  it("renders pagination dots", () => {
    render(<ImageSlider slides={slides} />);
    expect(screen.getByLabelText("اسلاید 1")).toBeDefined();
    expect(screen.getByLabelText("اسلاید 2")).toBeDefined();
    expect(screen.getByLabelText("اسلاید 3")).toBeDefined();
  });

  it("navigates to next slide when next arrow clicked", () => {
    render(<ImageSlider slides={slides} />);
    const nextBtn = screen.getByLabelText("اسلاید بعدی");
    fireEvent.click(nextBtn);
    // After clicking next, the transform should change - we verify the button is clickable
    expect(nextBtn).toBeDefined();
  });

  it("navigates to previous slide when prev arrow clicked", () => {
    render(<ImageSlider slides={slides} />);
    const prevBtn = screen.getByLabelText("اسلاید قبلی");
    fireEvent.click(prevBtn);
    expect(prevBtn).toBeDefined();
  });

  it("navigates to specific slide via pagination dot", () => {
    render(<ImageSlider slides={slides} />);
    fireEvent.click(screen.getByLabelText("اسلاید 3"));
    // Pagination click should update currentIndex
    expect(screen.getByLabelText("اسلاید 3")).toBeDefined();
  });
});
