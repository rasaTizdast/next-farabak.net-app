import { prisma } from "@/lib/prisma";

import { cachedQuery } from "./cache";
import { TAGS } from "./tags";

// /api/activities
async function queryActivities() {
  const activities = await prisma.master_activity.findMany({
    include: { Details_activity: true },
  });

  return activities;
}

export const getActivities = cachedQuery("getActivities", queryActivities, {
  revalidate: 3600,
  tags: [TAGS.activities],
});
