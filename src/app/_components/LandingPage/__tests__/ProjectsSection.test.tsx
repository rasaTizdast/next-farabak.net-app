import { cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    projects: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} alt={props.alt} />,
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const project = {
  ProjectID: 1,
  Title: "Project 1",
  Description: "Description 1",
  Main_img_URL: "img1.jpg",
  date: new Date(),
  city: "Tehran",
  Slug: "project-1",
};

describe("ProjectsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders projects heading", async () => {
    mockPrisma.projects.findMany.mockResolvedValue([]);

    const { default: ProjectsSection } = await import("../ProjectsSection");
    const { render, screen } = await import("@testing-library/react");
    render(await ProjectsSection());

    expect(screen.getByText("پروژه‌ها")).toBeDefined();
  });

  it("renders projects from database response", async () => {
    mockPrisma.projects.findMany.mockResolvedValue([project]);

    const { default: ProjectsSection } = await import("../ProjectsSection");
    const { render, screen } = await import("@testing-library/react");
    render(await ProjectsSection());

    expect(screen.getByText("Project 1")).toBeDefined();
    expect(screen.getByText("Tehran")).toBeDefined();
  });

  it("shows empty state when no projects", async () => {
    mockPrisma.projects.findMany.mockResolvedValue([]);

    const { default: ProjectsSection } = await import("../ProjectsSection");
    const { render, screen } = await import("@testing-library/react");
    render(await ProjectsSection());

    expect(screen.getByText("هیچ پروژه ای یافت نشد")).toBeDefined();
  });

  it("renders all projects link", async () => {
    mockPrisma.projects.findMany.mockResolvedValue([]);

    const { default: ProjectsSection } = await import("../ProjectsSection");
    const { render, screen } = await import("@testing-library/react");
    render(await ProjectsSection());

    const allLink = screen.getByText("مشاهده تمامی پروژه‌های انجام شده");
    expect(allLink.closest("a")?.getAttribute("href")).toBe("/about-us/projects");
  });

  it("shows empty state when database query fails", async () => {
    mockPrisma.projects.findMany.mockRejectedValue(new Error("DB error"));

    const { default: ProjectsSection } = await import("../ProjectsSection");
    const { render, screen } = await import("@testing-library/react");
    render(await ProjectsSection());

    expect(screen.getByText("هیچ پروژه ای یافت نشد")).toBeDefined();
  });
});
