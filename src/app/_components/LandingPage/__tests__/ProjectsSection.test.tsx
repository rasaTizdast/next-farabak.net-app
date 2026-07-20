import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("../ProjectsSection.module.css", () => ({
  default: {
    container: "container",
    project_parent: "project_parent",
    projects: "projects",
    project: "project",
    details: "details",
    all_projects: "all_projects",
    emptyState: "emptyState",
  },
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("ProjectsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders projects heading", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    const { default: ProjectsSection } = await import("../ProjectsSection");
    const { render, screen } = await import("@testing-library/react");
    render(await ProjectsSection());

    expect(screen.getByText("پروژه‌ها")).toBeDefined();
  });

  it("renders projects from API response", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        { id: 1, title: "Project 1", slug: "project-1", location: "Tehran", mainImg: "img1.jpg" },
      ],
    });

    const { default: ProjectsSection } = await import("../ProjectsSection");
    const { render, screen } = await import("@testing-library/react");
    render(await ProjectsSection());

    expect(screen.getByText("Project 1")).toBeDefined();
    expect(screen.getByText("Tehran")).toBeDefined();
  });

  it("shows empty state when no projects", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    const { default: ProjectsSection } = await import("../ProjectsSection");
    const { render, screen } = await import("@testing-library/react");
    render(await ProjectsSection());

    expect(screen.getByText("هیچ پروژه ای یافت نشد")).toBeDefined();
  });

  it("renders all projects link", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    const { default: ProjectsSection } = await import("../ProjectsSection");
    const { render, screen } = await import("@testing-library/react");
    render(await ProjectsSection());

    const allLink = screen.getByText("مشاهده تمامی پروژه‌های انجام شده");
    expect(allLink.closest("a")?.getAttribute("href")).toBe("/about-us/projects");
  });

  it("shows empty state on fetch failure", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const { default: ProjectsSection } = await import("../ProjectsSection");
    const { render, screen } = await import("@testing-library/react");
    render(await ProjectsSection());

    expect(screen.getByText("هیچ پروژه ای یافت نشد")).toBeDefined();
  });
});
