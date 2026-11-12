import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { TAGS } from "@/lib/data/tags";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/activities:
 *   get:
 *     summary: Get all master activities with details
 *     responses:
 *       200:
 *         description: List of master activities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MasterActivity'
 *   put:
 *     summary: Update a master activity or its details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MasterActivity'
 *     responses:
 *       200:
 *         description: Master activity updated
 */

type DetailsActivity = {
  id?: number;
  activityID?: number;
  description: string;
};

type MasterActivity = {
  id?: number;
  title: string;
  Details_activity: DetailsActivity[]; // Use `Details_activity` instead of `details`
};

export async function GET() {
  const activities = await prisma.master_activity.findMany({
    include: { Details_activity: true },
  });
  return NextResponse.json(activities, { status: 200 });
}

export async function PUT(req: NextRequest) {
  try {
    const updatedActivities: MasterActivity[] = await req.json(); // Get the data sent from the frontend

    if (!Array.isArray(updatedActivities)) {
      throw new Error("The data is not in the expected format.");
    }

    await prisma.$transaction(async (tx) => {
      const existingActivities = await tx.master_activity.findMany({
        include: { Details_activity: true },
      });
      const deletedActivities = existingActivities.filter(
        (existingActivity) =>
          !updatedActivities.some((updatedActivity) => updatedActivity.id === existingActivity.id)
      );

      for (const activity of deletedActivities) {
        await tx.details_activity.deleteMany({ where: { activityID: activity.id } });
        await tx.master_activity.delete({ where: { id: activity.id } });
      }

      for (const activity of updatedActivities) {
        const masterActivity = activity.id
          ? await tx.master_activity.update({
              where: { id: activity.id },
              data: { title: activity.title },
            })
          : await tx.master_activity.create({ data: { title: activity.title } });
        const detailIds = activity.Details_activity.flatMap((detail) =>
          detail.id ? [detail.id] : []
        );

        await tx.details_activity.deleteMany({
          where: {
            activityID: masterActivity.id,
            ...(detailIds.length > 0 ? { id: { notIn: detailIds } } : {}),
          },
        });

        for (const detail of activity.Details_activity) {
          if (detail.id) {
            await tx.details_activity.update({
              where: { id: detail.id },
              data: { description: detail.description },
            });
          } else {
            await tx.details_activity.create({
              data: { activityID: masterActivity.id, description: detail.description },
            });
          }
        }
      }
    });

    revalidateTag(TAGS.activities, "max");
    return NextResponse.json({ message: "Updated successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
