import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

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

const singleSlide = [slides[0]];

describe("ImageSlider", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders virtual slides (n+2 for infinite loop)", () => {
    const { container } = render(<ImageSlider slides={slides} />);
    // 3 real + 2 clones = 5
    expect(container.querySelectorAll("img")).toHaveLength(5);
  });

  it("renders single slide without cloning", () => {
    const { container } = render(<ImageSlider slides={singleSlide} />);
    expect(container.querySelectorAll("img")).toHaveLength(1);
  });

  it("renders slide images with correct alt text", () => {
    const { container } = render(<ImageSlider slides={slides} />);
    const images = container.querySelectorAll("img");
    const altTexts = Array.from(images).map((img) => img.getAttribute("alt"));
    expect(altTexts).toContain("Slide 1");
    expect(altTexts).toContain("Slide 2");
    expect(altTexts).toContain("Slide 3");
  });

  it("renders slide links (virtual count)", () => {
    const { container } = render(<ImageSlider slides={slides} />);
    const links = container.querySelectorAll("a[href]");
    // 3 real + 2 clones = 5
    expect(links).toHaveLength(5);
    expect(links[0].getAttribute("href")).toBe("/link3");
    expect(links[1].getAttribute("href")).toBe("/link1");
    expect(links[2].getAttribute("href")).toBe("/link2");
    expect(links[3].getAttribute("href")).toBe("/link3");
    expect(links[4].getAttribute("href")).toBe("/link1");
  });

  it("renders navigation arrow buttons", () => {
    render(<ImageSlider slides={slides} />);
    expect(screen.getByLabelText("اسلاید بعدی")).toBeDefined();
    expect(screen.getByLabelText("اسلاید قبلی")).toBeDefined();
  });

  it("renders pagination dots", () => {
    render(<ImageSlider slides={slides} />);
    expect(screen.getByLabelText("رفتن به اسلاید 1")).toBeDefined();
    expect(screen.getByLabelText("رفتن به اسلاید 2")).toBeDefined();
    expect(screen.getByLabelText("رفتن به اسلاید 3")).toBeDefined();
  });

  it("navigates to next slide when next arrow clicked", () => {
    render(<ImageSlider slides={slides} />);
    const nextBtn = screen.getByLabelText("اسلاید بعدی");
    fireEvent.click(nextBtn);
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
    fireEvent.click(screen.getByLabelText("رفتن به اسلاید 3"));
    expect(screen.getByLabelText("رفتن به اسلاید 3")).toBeDefined();
  });

  it("renders empty when no slides provided", () => {
    const { container } = render(<ImageSlider slides={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("starts at the first real slide (index 1 in virtual slides)", () => {
    const { container } = render(<ImageSlider slides={slides} />);
    const links = Array.from(container.querySelectorAll("a[href]"));
    // The second link (index 1, first real slide) should be active (tabindex 0)
    expect(links[1].getAttribute("tabindex")).toBe("0");
    expect(links[0].getAttribute("tabindex")).toBe("-1");
    expect(links[2].getAttribute("tabindex")).toBe("-1");
  });

  it("renders carousel region with correct aria attributes", () => {
    render(<ImageSlider slides={slides} />);
    const region = screen.getByRole("region", { name: "اسلایدر تصاویر" });
    expect(region).toBeDefined();
    expect(region.getAttribute("aria-roledescription")).toBe("carousel");
  });

  it("renders screen-reader status text", () => {
    render(<ImageSlider slides={slides} />);
    expect(screen.getByText(/اسلاید 1 از 3/)).toBeDefined();
  });

  it("supports keyboard navigation", () => {
    render(<ImageSlider slides={slides} />);
    const slider = screen.getByRole("region", { name: "اسلایدر تصاویر" });
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    fireEvent.keyDown(slider, { key: "Home" });
    fireEvent.keyDown(slider, { key: "End" });
  });

  it("does not navigate when slides length <= 1", () => {
    render(<ImageSlider slides={singleSlide} />);
    // nextSlide/prevSlide have early return for single slide
    const prevBtn = screen.getByLabelText("اسلاید قبلی");
    const nextBtn = screen.getByLabelText("اسلاید بعدی");
    fireEvent.click(prevBtn);
    fireEvent.click(nextBtn);
  });

  it("prevents link navigation after drag", () => {
    const { container } = render(<ImageSlider slides={slides} />);
    const links = Array.from(container.querySelectorAll("a[href]"));
    const firstLink = links[1]; // first real slide
    fireEvent.dragStart(firstLink);
  });
});
