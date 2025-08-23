import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma"; // Ensure you have a prisma client instance

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "your_refresh_token_secret";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, firstName, lastName, phoneNumber, email, city, job, password } = body;

    // Validate required fields
    if (
      !username ||
      !firstName ||
      !lastName ||
      !phoneNumber ||
      !email ||
      !city ||
      !job ||
      !password
    ) {
      return NextResponse.json(
        { message: "لطفا تمام فیلدهای ضروری را تکمیل کنید" },
        { status: 400 }
      );
    }

    // Check if the username or email already exists
    const existingUser = await prisma.client.findFirst({
      where: {
        OR: [{ Username: username }, { Email: email }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "این نام کاربری یا ایمیل قبلاً ثبت شده است" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user in the database
    const newUser = await prisma.client.create({
      data: {
        Username: username,
        FirstName: firstName,
        LastName: lastName,
        PhoneNumber: phoneNumber,
        Email: email,
        City: city,
        Job: job,
      },
    });

    // Save the hashed password
    await prisma.password.create({
      data: {
        Password1: hashedPassword,
        UserId: newUser.UserID,
        Active: true,
      },
    });

    // Generate Access Token using jose
    const accessToken = await new SignJWT({
      userId: newUser.UserID,
      username,
      role: "public",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(new TextEncoder().encode(JWT_SECRET));

    // Generate Refresh Token using jose
    const refreshToken = await new SignJWT({
      userId: newUser.UserID,
      username,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(new TextEncoder().encode(REFRESH_TOKEN_SECRET));

    // Set cookies
    const response = NextResponse.json({
      message: "ثبت نام با موفقیت انجام شد",
    });
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60,
      path: "/",
    });
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "خطای داخلی سرور رخ داده است" }, { status: 500 });
  }
}
