import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET handler to fetch contact us data
export async function GET() {
  try {
    const address = await prisma.address.findFirst();
    const emails = await prisma.emails.findMany();
    const phoneNumbers = await prisma.phone_numbers.findMany();

    // Filter out emails with empty address
    const filteredEmails = emails.filter((email) => email.address && email.address.trim() !== "");

    // Filter out phone numbers with empty number
    const filteredPhoneNumbers = phoneNumbers.filter(
      (phone) => phone.number && phone.number.trim() !== ""
    );

    return NextResponse.json({
      address,
      emails: filteredEmails,
      phone_numbers: filteredPhoneNumbers,
    });
  } catch (error) {
    console.error("Error fetching contact us data:", error);
    return NextResponse.json({ message: "خطایی در دریافت اطلاعات رخ داد." }, { status: 500 });
  }
}

// PUT handler to update contact us data
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, emails, phone_numbers } = body;

    // Use a transaction to ensure all updates are applied together
    await prisma.$transaction(async (tx) => {
      // Update address
      if (address) {
        await tx.address.update({
          where: { id: address.id },
          data: {
            address: address.address,
            postal_code: address.postal_code,
            alt_text: address.alt_text,
          },
        });
      }

      // Update emails - preserve order by updating with index
      if (emails && emails.length > 0) {
        // First, update each email record to maintain their data
        for (let i = 0; i < emails.length; i++) {
          const email = emails[i];
          await tx.emails.update({
            where: { id: email.id },
            data: {
              title: email.title,
              address: email.address,
            },
          });
        }
      }

      // Update phone numbers - preserve order by updating with index
      if (phone_numbers && phone_numbers.length > 0) {
        for (let i = 0; i < phone_numbers.length; i++) {
          const phone = phone_numbers[i];
          await tx.phone_numbers.update({
            where: { id: phone.id },
            data: {
              number: phone.number,
            },
          });
        }
      }
    });

    return NextResponse.json({ message: "اطلاعات با موفقیت به‌روزرسانی شد." });
  } catch (error) {
    console.error("Error updating contact us data:", error);
    return NextResponse.json({ message: "خطایی در به‌روزرسانی اطلاعات رخ داد." }, { status: 500 });
  }
}
