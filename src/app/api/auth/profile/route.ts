import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectToDatabase } from "../../../../../lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get the authenticated user's profile.
 *     tags: [auth]
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phoneNumber:
 *                   type: string
 *       401:
 *         description: Unauthorized access.
 *       500:
 *         description: Internal server error.
 *
 *   patch:
 *     summary: Update the authenticated user's profile.
 *     tags: [auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: New first name
 *               lastName:
 *                 type: string
 *                 description: New last name
 *               email:
 *                 type: string
 *                 description: New email
 *               phoneNumber:
 *                 type: string
 *                 description: New phone number
 *               job:
 *                 type: string
 *                 description: New job
 *               city:
 *                 type: string
 *                 description: New city
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *       400:
 *         description: No valid fields provided for update.
 *       401:
 *         description: Unauthorized access.
 *       500:
 *         description: Internal server error.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Authorization token required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET!) as { userId: string };

    const pool = await connectToDatabase();
    const result = await pool.request().input("UserId", decoded.userId).query(`
        SELECT userId, firstName, lastName, email, phoneNumber 
        FROM info.client 
        WHERE userId = @UserId
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Authorization token required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET!) as { userId: string };

    const updates: {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      email?: string;
      city?: string;
      job?: string;
    } = await request.json();

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { message: "No data provided for update" },
        { status: 400 }
      );
    }

    let updateFields = "";
    const updateParams: { [key: string]: string } = {};

    if (updates.firstName) {
      updateFields += "firstName = @FirstName, ";
      updateParams.FirstName = updates.firstName;
    }
    if (updates.lastName) {
      updateFields += "lastName = @LastName, ";
      updateParams.LastName = updates.lastName;
    }
    if (updates.email) {
      updateFields += "email = @Email, ";
      updateParams.Email = updates.email;
    }
    if (updates.phoneNumber) {
      updateFields += "phoneNumber = @PhoneNumber, ";
      updateParams.PhoneNumber = updates.phoneNumber;
    }
    if (updates.city) {
      updateFields += "city = @City, ";
      updateParams.City = updates.city;
    }
    if (updates.job) {
      updateFields += "job = @Job, ";
      updateParams.Job = updates.job;
    }

    updateFields = updateFields.slice(0, -2); // Remove the trailing comma and space

    if (!updateFields) {
      return NextResponse.json(
        { message: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    const pool = await connectToDatabase();
    const requestQuery = pool.request().input("UserId", decoded.userId);

    for (const [key, value] of Object.entries(updateParams)) {
      requestQuery.input(key, value);
    }

    await requestQuery.query(`
      UPDATE info.client 
      SET ${updateFields}
      WHERE userId = @UserId;
    `);

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
