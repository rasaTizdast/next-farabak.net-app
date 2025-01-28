import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  // Static data
  const rowNames: PageRow[] = [
    { name: "صفحه اصلی", pages: 1, link: "/", editorType: "landingPage" },
    {
      name: "بلاگ",
      pages: 0, // Placeholder, will be updated dynamically
      link: "/support/blog",
      multiPage: true,
      editorType: "blog",
      newType: "newBlog",
    },
    {
      name: "اعضا هیئت مدیره",
      pages: 0, // Placeholder, will be updated dynamically
      link: "/about-us/members",
      multiPage: true,
      editorType: "member",
      newType: "newMember",
    },
    {
      name: "پروژه‌ها",
      pages: 0, // Placeholder, will be updated dynamically
      link: "/about-us/projects",
      multiPage: true,
      editorType: "project",
      newType: "newProject",
    },
    {
      name: "فعالیت شرکت",
      pages: 1,
      link: "/about-us/activity",
      editorType: "activity",
    },
    {
      name: "تماس با ما",
      pages: 1,
      link: "/contact-us",
      editorType: "contact",
    },
  ];

  // Fetch dynamic data from the database
  const blogs = await prisma.blogs.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
    },
  });

  const members = await prisma.members.findMany({
    select: {
      Membersid: true,
      Name: true,
      Slug: true,
    },
    orderBy: { Membersid: "asc" },
  });

  const projects = await prisma.projects.findMany({
    select: {
      ProjectID: true,
      Title: true,
      Slug: true,
    },
  });

  // Map the fetched data to the subPages structure
  const subPages: Record<string, SubPage[]> = {
    "/support/blog": blogs.map((blog) => ({
      id: blog.id,
      name: blog.title,
      link: `/support/blog/${blog.slug}`,
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

  // Update the `pages` property in `rowNames` based on the fetched data
  rowNames[1].pages = blogs.length; // Update blog pages count
  rowNames[2].pages = members.length; // Update members pages count
  rowNames[3].pages = projects.length; // Update projects pages count

  const response: ApiResponse = {
    rowNames,
    subPages,
  };

  return NextResponse.json(response);
}
