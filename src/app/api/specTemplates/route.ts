import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

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

// GET /api/specTemplates - Get all templates
export async function GET() {
  try {
    // Using the correct case as defined in the schema
    const templates = await prisma.$queryRaw<SpecTemplate[]>`
      SELECT * FROM "support"."SpecTemplate"
    `;

    // For each template, get its items in parallel
    const itemsList = await Promise.all(
      templates.map(
        (template) =>
          prisma.$queryRaw<SpecTemplateItem[]>`
          SELECT * FROM "support"."SpecTemplateItem" 
          WHERE "SpecTemplateId" = ${template.SpecTemplateId}
        `
      )
    );
    templates.forEach((template, i) => {
      template.Items = itemsList[i];
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching spec templates:", error);
    return NextResponse.json({ message: "Error fetching spec templates" }, { status: 500 });
  }
}

// POST /api/specTemplates - Create a new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { Name, Items } = body;

    if (!Name) {
      return NextResponse.json({ message: "Template name is required" }, { status: 400 });
    }

    // Create the template using raw SQL
    type ResultRow = { SpecTemplateId: number };
    const result = await prisma.$queryRaw<ResultRow[]>`
      INSERT INTO "support"."SpecTemplate" ("Name", "InsertDate", "ModifyDate")
      VALUES (${Name}, NOW(), NOW())
      RETURNING "SpecTemplateId"
    `;

    const templateId = result[0].SpecTemplateId;

    // Then create all items using raw SQL
    if (Items && Items.length > 0) {
      await Promise.all(
        Items.map(
          (item) =>
            prisma.$queryRaw`
            INSERT INTO "support"."SpecTemplateItem" ("SpecTemplateId", "Title", "InsertDate", "ModifyDate")
            VALUES (${templateId}, ${item.Title}, NOW(), NOW())
          `
        )
      );
    }

    // Get the complete template with items
    const template = await prisma.$queryRaw<SpecTemplate[]>`
      SELECT * FROM "support"."SpecTemplate" WHERE "SpecTemplateId" = ${templateId}
    `;

    const items = await prisma.$queryRaw<SpecTemplateItem[]>`
      SELECT * FROM "support"."SpecTemplateItem" WHERE "SpecTemplateId" = ${templateId}
    `;

    const completeTemplate = {
      ...template[0],
      Items: items,
    };

    return NextResponse.json(completeTemplate);
  } catch (error) {
    console.error("Error creating spec template:", error);
    return NextResponse.json({ message: "Error creating spec template" }, { status: 500 });
  }
}
