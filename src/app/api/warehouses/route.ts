import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        warehouseproduct: {
          include: {
            Product: true,
            ProductGrade: true,
          },
        },
      },
    });
    return NextResponse.json(warehouses);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch warehouses" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const warehouse = await prisma.warehouse.create({
      data: {
        name: data.name,
        location: data.location,
      },
    });
    return NextResponse.json(warehouse);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create warehouse" }, { status: 500 });
  }
}
