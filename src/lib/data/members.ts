import type { Members } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { cachedQuery } from "./cache";
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

export const getMembers = cachedQuery("getMembers", queryMembers, {
  revalidate: 120,
  tags: [TAGS.members],
});

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

export const getMemberPage = cachedQuery("getMemberPage", queryMemberPage, {
  revalidate: 120,
  tags: [TAGS.members],
});
