import type { Members } from "@prisma/client";
import { cacheLife, cacheTag } from "next/cache";

import { prisma } from "@/lib/prisma";

import { TAGS } from "./tags";

// ---------------------------------------------------------------------------
// /api/members
// ---------------------------------------------------------------------------

async function queryMembers(): Promise<Members[]> {
  const members = await prisma.members.findMany({
    orderBy: { Membersid: "asc" },
  });

  return members;
}

export async function getMembers(): Promise<Members[]> {
  "use cache";
  cacheTag(TAGS.members);
  cacheLife("hours");

  return queryMembers();
}

// ---------------------------------------------------------------------------
// /api/members/memberPage/:slug
// ---------------------------------------------------------------------------

async function queryMemberPage(slug: string): Promise<Members | null> {
  const member = await prisma.members.findUnique({
    where: {
      Slug: slug,
    },
  });

  return member;
}

export async function getMemberPage(slug: string): Promise<Members | null> {
  "use cache";
  cacheTag(TAGS.members);
  cacheLife("hours");

  return queryMemberPage(slug);
}
