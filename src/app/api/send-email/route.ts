// /app/api/send-email/route.ts
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/send-email:
 *   post:
 *     summary: Send an email to a client's email address.
 *     description: Sends an email using a custom SMTP server. Ensure that the SMTP credentials are correct.
 *     tags: [email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *                 example: "client@example.com"
 *                 description: "The email address of the recipient."
 *               subject:
 *                 type: string
 *                 example: "Welcome to our service!"
 *                 description: "The subject of the email."
 *               text:
 *                 type: string
 *                 example: "Thank you for joining us! We're excited to have you."
 *                 description: "The text content of the email."
 *     responses:
 *       200:
 *         description: Email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email sent successfully"
 *       400:
 *         description: Bad Request - Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Please provide to, subject, and text fields"
 *       500:
 *         description: Server Error - Failed to send email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to send email"
 *                 details:
 *                   type: string
 *                   example: "Error details here"
 */

const transporter = nodemailer.createTransport({
  host: process.env.WEBMAIL_HOST,
  port: parseInt(process.env.WEBMAIL_PORT || "587", 10),
  secure: process.env.WEBMAIL_PORT === "465",
  auth: {
    user: process.env.WEBMAIL_USER,
    pass: process.env.WEBMAIL_PASS,
  },
});

export async function POST(req: Request) {
  const { to, subject, text } = await req.json();

  if (!to || !subject || !text) {
    return NextResponse.json(
      { error: "Please provide to, subject, and text fields" },
      { status: 400 }
    );
  }

  const mailOptions = {
    from: process.env.WEBMAIL_USER,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error: unknown) {
    // Check if the error is an instance of the Error class
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Failed to send email", details: error.message },
        { status: 500 }
      );
    } else {
      // Fallback in case error is not an instance of Error
      return NextResponse.json(
        { error: "Failed to send email", details: "Unknown error" },
        { status: 500 }
      );
    }
  }
}
