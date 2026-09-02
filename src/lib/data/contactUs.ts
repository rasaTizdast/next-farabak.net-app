import type { address, emails, phone_numbers } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { cachedQuery } from "./cache";
import { TAGS } from "./tags";

export interface ContactInfoResult {
  address: address | null;
  emails: emails[];
  phone_numbers: phone_numbers[];
}

async function queryContactInfo(): Promise<ContactInfoResult> {
  const [addressRow, emailsRows, phoneNumberRows] = await Promise.all([
    prisma.address.findFirst(),
    prisma.emails.findMany(),
    prisma.phone_numbers.findMany(),
  ]);

  const filteredEmails = emailsRows.filter((email) => email.address && email.address.trim() !== "");

  const filteredPhoneNumbers = phoneNumberRows.filter(
    (phone) => phone.number && phone.number.trim() !== ""
  );

  return {
    address: addressRow,
    emails: filteredEmails,
    phone_numbers: filteredPhoneNumbers,
  };
}

export const getContactInfo = cachedQuery("getContactInfo", queryContactInfo, {
  revalidate: 3600,
  tags: [TAGS.contactUs],
});
