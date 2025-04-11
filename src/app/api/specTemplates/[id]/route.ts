import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface SpecTemplate {
  SpecTemplateId: number;
  Name: string;
  InsertDate: Date;
  ModifyDate: Date;
  Items?: SpecTemplateItem[];
}

interface SpecTemplateItem {
  SpecTemplateItemId: number;
  SpecTemplateId: number;
  Title: string;
  InsertDate: Date;
  ModifyDate: Date;
}

// GET /api/specTemplates/[id] - Get a specific template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid template ID" },
        { status: 400 }
      );
    }

    // Get template using raw SQL
    const templates = await prisma.$queryRaw<SpecTemplate[]>`
      SELECT * FROM "support"."SpecTemplate" WHERE "SpecTemplateId" = ${id}
    `;

    if (!templates || templates.length === 0) {
      return NextResponse.json(
        { message: "Template not found" },
        { status: 404 }
      );
    }

    const template = templates[0];

    // Get template items
    const items = await prisma.$queryRaw<SpecTemplateItem[]>`
      SELECT * FROM "support"."SpecTemplateItem" WHERE "SpecTemplateId" = ${id}
    `;

    template.Items = items;

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error fetching spec template:", error);
    return NextResponse.json(
      { message: "Error fetching spec template" },
      { status: 500 }
    );
  }
}

// PUT /api/specTemplates/[id] - Update a template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { Name, Items } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid template ID" },
        { status: 400 }
      );
    }

    if (!Name) {
      return NextResponse.json(
        { message: "Template name is required" },
        { status: 400 }
      );
    }

    // Update the template using raw SQL
    await prisma.$queryRaw`
      UPDATE "support"."SpecTemplate" 
      SET "Name" = ${Name}, "ModifyDate" = NOW()
      WHERE "SpecTemplateId" = ${id}
    `;

    // Delete all existing items using raw SQL
    await prisma.$queryRaw`
      DELETE FROM "support"."SpecTemplateItem" 
      WHERE "SpecTemplateId" = ${id}
    `;

    // Create new items using raw SQL
    if (Items && Items.length > 0) {
      for (const item of Items) {
        await prisma.$queryRaw`
          INSERT INTO "support"."SpecTemplateItem" ("SpecTemplateId", "Title", "InsertDate", "ModifyDate")
          VALUES (${id}, ${item.Title}, NOW(), NOW())
        `;
      }
    }

    // Get the updated template
    const templates = await prisma.$queryRaw<SpecTemplate[]>`
      SELECT * FROM "support"."SpecTemplate" WHERE "SpecTemplateId" = ${id}
    `;

    const items = await prisma.$queryRaw<SpecTemplateItem[]>`
      SELECT * FROM "support"."SpecTemplateItem" WHERE "SpecTemplateId" = ${id}
    `;

    const updatedTemplate = {
      ...templates[0],
      Items: items,
    };

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error("Error updating spec template:", error);
    return NextResponse.json(
      { message: "Error updating spec template" },
      { status: 500 }
    );
  }
}

// DELETE /api/specTemplates/[id] - Delete a template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid template ID" },
        { status: 400 }
      );
    }

    // Delete the template using raw SQL (cascade delete will handle items)
    await prisma.$queryRaw`
      DELETE FROM "support"."SpecTemplate" 
      WHERE "SpecTemplateId" = ${id}
    `;

    return NextResponse.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting spec template:", error);
    return NextResponse.json(
      { message: "Error deleting spec template" },
      { status: 500 }
    );
  }
}
