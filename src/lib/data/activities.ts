import { cacheLife, cacheTag } from "next/cache";

import { prisma } from "@/lib/prisma";

import { TAGS } from "./tags";

// /api/activities
async function queryActivities() {
  const activities = await prisma.master_activity.findMany({
    include: { Details_activity: true },
  });

  return activities;
}

export async function getActivities() {
  "use cache";
  cacheTag(TAGS.activities);
  cacheLife("hours");

  return queryActivities();
}
