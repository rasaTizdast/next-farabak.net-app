import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * components:
 *   schemas:
 *     DetailsActivity:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         activityID:
 *           type: integer
 *         description:
 *           type: string
 *     MasterActivity:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         details:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DetailsActivity'
 */

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

export async function GET() {
  const activities = await prisma.master_activity.findMany({
    include: { Details_activity: true },
  });
  return NextResponse.json(activities, { status: 200 });
}

export async function PUT(req: NextRequest) {
  try {
    const updatedActivities = await req.json(); // Get the data sent from the frontend

    if (!Array.isArray(updatedActivities)) {
      throw new Error("The data is not in the expected format.");
    }

    // Fetch all existing activities from the database
    const existingActivities = await prisma.master_activity.findMany({
      include: { Details_activity: true },
    });

    // Identify activities that have been deleted in the frontend
    const deletedActivities = existingActivities.filter(
      (existingActivity) =>
        !updatedActivities.some(
          (updatedActivity) => updatedActivity.id === existingActivity.id
        )
    );

    // Delete associated Details_activity records first
    for (const deletedActivity of deletedActivities) {
      await prisma.details_activity.deleteMany({
        where: { activityID: deletedActivity.id },
      });
    }

    // Delete the Master_activity records
    for (const deletedActivity of deletedActivities) {
      await prisma.master_activity.delete({
        where: { id: deletedActivity.id },
      });
    }

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
      for (const detail of activity.details) {
        if (detail.id) {
          // Update existing Details_activity
          await prisma.details_activity.update({
            where: { id: detail.id },
            data: { description: detail.description },
          });
        } else {
          // Create new Details_activity
          await prisma.details_activity.create({
            data: {
              activityID: masterActivity.id, // Link it to the master activity
              description: detail.description,
            },
          });
        }
      }
    }

    return NextResponse.json(
      { message: "Updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
