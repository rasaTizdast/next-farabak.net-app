import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust the import based on your Prisma setup

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Delete the slider from the database
    await prisma.sliders.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "اسلایدر با موفقیت حذف شد." });
  } catch (error) {
    return NextResponse.json({ error: "خطا در حذف اسلایدر." }, { status: 500 });
  }
}
