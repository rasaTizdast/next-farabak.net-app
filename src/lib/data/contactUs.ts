import type { address, emails, phone_numbers } from "@prisma/client";
import { cacheLife, cacheTag } from "next/cache";

import { prisma } from "@/lib/prisma";

import { isPrismaConnectivityError } from "./prismaAvailability";
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

async function getCachedContactInfo(): Promise<ContactInfoResult> {
  "use cache";
  cacheTag(TAGS.contactUs);
  cacheLife("hours");

  return queryContactInfo();
}

export async function getContactInfo(): Promise<ContactInfoResult> {
  try {
    return await getCachedContactInfo();
  } catch (error) {
    if (!isPrismaConnectivityError(error)) throw error;

    // Only expected database connection failures use the uncached fallback.
    return { address: null, emails: [], phone_numbers: [] };
  }
}
