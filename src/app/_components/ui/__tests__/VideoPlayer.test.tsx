import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import VideoPlayer from "../VideoPlayer";

describe("VideoPlayer", () => {
  it("renders the video element with the correct source", () => {
    const { container } = render(<VideoPlayer url="https://example.com/video.mp4" />);
    const video = container.querySelector("video");
    expect(video).toBeDefined();
  });

  it("renders the heading text", () => {
    render(<VideoPlayer url="https://example.com/video.mp4" />);
    expect(screen.getByText("کلیپ معرفی پروژه")).toBeDefined();
  });

  it("passes the url to the source element", () => {
    const { container } = render(<VideoPlayer url="https://example.com/test.mp4" />);
    const source = container.querySelector("source");
    expect(source).toBeDefined();
    expect(source?.getAttribute("src")).toBe("https://example.com/test.mp4");
  });

  it("sets video type to mp4", () => {
    const { container } = render(<VideoPlayer url="https://example.com/video.mp4" />);
    const source = container.querySelector("source");
    expect(source?.getAttribute("type")).toBe("video/mp4");
  });

  it("renders video with controls attribute", () => {
    const { container } = render(<VideoPlayer url="https://example.com/video.mp4" />);
    const video = container.querySelector("video");
    expect(video).toBeDefined();
    expect(video?.hasAttribute("controls")).toBe(true);
  });
});
