import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";


// GET handler to fetch contact us data
export async function GET() {
  try {
    const address = await prisma.address.findFirst();
    const emails = await prisma.emails.findMany();
    const phoneNumbers = await prisma.phone_numbers.findMany();

    return NextResponse.json({
      address,
      emails,
      phone_numbers: phoneNumbers,
    });
  } catch (error) {
    console.error("Error fetching contact us data:", error);
    return NextResponse.json(
      { message: "خطایی در دریافت اطلاعات رخ داد." },
      { status: 500 }
    );
  }
}

// PUT handler to update contact us data
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, emails, phone_numbers } = body;

    // Update address
    if (address) {
      await prisma.address.update({
        where: { id: address.id },
        data: {
          address: address.address,
          postal_code: address.postal_code,
          alt_text: address.alt_text,
        },
      });
    }

    // Update emails
    if (emails && emails.length > 0) {
      for (const email of emails) {
        await prisma.emails.update({
          where: { id: email.id },
          data: {
            title: email.title,
            address: email.address,
          },
        });
      }
    }

    // Update phone numbers
    if (phone_numbers && phone_numbers.length > 0) {
      for (const phone of phone_numbers) {
        await prisma.phone_numbers.update({
          where: { id: phone.id },
          data: {
            number: phone.number,
          },
        });
      }
    }

    return NextResponse.json({ message: "اطلاعات با موفقیت به‌روزرسانی شد." });
  } catch (error) {
    console.error("Error updating contact us data:", error);
    return NextResponse.json(
      { message: "خطایی در به‌روزرسانی اطلاعات رخ داد." },
      { status: 500 }
    );
  }
}
