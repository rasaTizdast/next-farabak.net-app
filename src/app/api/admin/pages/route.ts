import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Define the response type
type PageRow = {
  name: string;
  pages: number;
  link: string;
  multiPage?: boolean;
  editorType: string;
  newType?: string | null;
};

type SubPage = {
  id: number;
  name: string;
  link: string;
};

type ApiResponse = {
  rowNames: PageRow[];
  subPages: Record<string, SubPage[]>;
};

/**
 * @swagger
 * /api/admin/pages:
 *   get:
 *     summary: Get data for the Admin Page Manager
 *     description: Returns the data required for the Admin Page Manager component, including static row names and dynamic subpages.
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rowNames:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PageRow'
 *                 subPages:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/SubPage'
 * components:
 *   schemas:
 *     PageRow:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         pages:
 *           type: number
 *         link:
 *           type: string
 *         multiPage:
 *           type: boolean
 *         editorType:
 *           type: string
 *         newType:
 *           type: string
 *     SubPage:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         name:
 *           type: string
 *         link:
 *           type: string
 */
export async function GET() {
  try {
    // Count member pages
    const members = await prisma.members.findMany({
      select: {
        Membersid: true,
        Name: true,
        Slug: true,
      },
    });

    // Count blog posts
    const blogs = await prisma.blogs.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        QrCode_key: true,
        QrCode_expiryDays: true,
        BlogCategories: {
          select: {
            Categories: true,
          },
        },
      },
    });

    // Count projects
    const projects = await prisma.projects.findMany({
      select: {
        ProjectID: true,
        Title: true,
        Slug: true,
      },
    });

    const rowNames = [
      {
        name: "صفحه اصلی",
        pages: 1,
        link: "/",
        multiPage: false,
        editorType: "landingPage",
      },
      {
        name: "بلاگ",
        pages: blogs.length,
        link: "/support/blog",
        multiPage: true,
        editorType: "blog",
        newType: "newBlog",
      },
      {
        name: "اعضا هیئت مدیره",
        pages: members.length,
        link: "/about-us/members",
        multiPage: true,
        editorType: "member",
        newType: "newMember",
      },
      {
        name: "پروژه‌ها",
        pages: projects.length,
        link: "/about-us/projects",
        multiPage: true,
        editorType: "project",
        newType: "newProject",
      },
      {
        name: "فعالیت شرکت",
        pages: 1,
        link: "/about-us/activity",
        multiPage: false,
        editorType: "activity",
      },
      {
        name: "تماس با ما",
        pages: 1,
        link: "/contact-us",
        multiPage: false,
        editorType: "contact",
      },
      {
        name: "سوالات متداول",
        pages: 1, // Changed to 1 as it's now a single page
        link: "/support/faq",
        multiPage: false, // Changed to false
        editorType: "faq",
      },
    ];

    // Subpages for multipage sections
    const subPages: SubPage[] = {
      "/support/blog": blogs.map((blog) => ({
        id: blog.id,
        name: blog.title,
        link: `/support/blog/${blog.BlogCategories[0].Categories.slug}/${blog.slug}`,
        QrCode_key: blog.QrCode_key,
        QrCode_expiryDays: blog.QrCode_expiryDays,
      })),
      "/about-us/members": members.map((member) => ({
        id: member.Membersid,
        name: member.Name,
        link: `/about-us/members/${member.Slug}`,
      })),
      "/about-us/projects": projects.map((project) => ({
        id: project.ProjectID,
        name: project.Title,
        link: `/about-us/projects/${project.Slug}`,
      })),
    };
    // Removed "/support/faq" from subpages since it's now a single page

    return NextResponse.json({ rowNames, subPages });
  } catch (error) {
    console.error("Error fetching page data:", error);
    return NextResponse.json({ error: "Failed to fetch page data" }, { status: 500 });
  }
}
