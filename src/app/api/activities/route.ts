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

export const dynamic = "force-dynamic";

type DetailsActivity = {
  id: number;
  activityID: number;
  description: string;
};

type MasterActivity = {
  id: number;
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

    // Fetch all existing activities from the database
    const existingActivities = await prisma.master_activity.findMany({
      include: { Details_activity: true },
    });

    // Identify activities that have been deleted in the frontend
    const deletedActivities = existingActivities.filter(
      (existingActivity: MasterActivity) =>
        !updatedActivities.some(
          (updatedActivity: MasterActivity) => updatedActivity.id === existingActivity.id
        )
    );

    // Delete associated Details_activity records first, then the Master_activity records
    await Promise.all(
      deletedActivities.map(async (deletedActivity) => {
        await prisma.details_activity.deleteMany({
          where: { activityID: deletedActivity.id },
        });
        await prisma.master_activity.delete({
          where: { id: deletedActivity.id },
        });
      })
    );

    // Handle updates and creations
    for (const activity of updatedActivities) {
      let masterActivity;
      if (activity.id) {
        // Update existing Master_activity
        masterActivity = await prisma.master_activity.update({
          where: { id: activity.id },
          data: { title: activity.title },
        });
      } else {
        // Create new Master_activity
        masterActivity = await prisma.master_activity.create({
          data: {
            title: activity.title,
          },
        });
      }

      // Handle the Details_activity for the master activity
      await Promise.all(
        activity.Details_activity.map(async (detail) => {
          if (detail.id) {
            await prisma.details_activity.update({
              where: { id: detail.id },
              data: { description: detail.description },
            });
          } else {
            await prisma.details_activity.create({
              data: {
                activityID: masterActivity.id,
                description: detail.description,
              },
            });
          }
        })
      );
    }

    revalidateTag(TAGS.activities, "max");
    return NextResponse.json({ message: "Updated successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
