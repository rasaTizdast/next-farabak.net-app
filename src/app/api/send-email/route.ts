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
 *               html:
 *                 type: string
 *                 example: "<p>Thank you for joining us! We're excited to have you.</p>"
 *                 description: "The HTML content of the email. If provided, it will be used instead of text."
 *               template:
 *                 type: string
 *                 example: "reset-password"
 *                 description: "The template to use for the email."
 *               templateData:
 *                 type: object
 *                 description: "Data to be used in the template."
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
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || "587", 10),
  secure: process.env.MAIL_PORT === "465",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Email templates
const templates = {
  "reset-password": (data: { code: string }) => ({
    subject: "بازیابی رمز عبور | فرابک",
    text: `کد بازیابی رمز عبور شما: ${data.code}\nاین کد تا ۱۵ دقیقه معتبر است.`,
    html: `
      <div dir="rtl" style="font-family: Tahoma, Arial; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">بازیابی رمز عبور</h2>
        <p style="font-size: 16px; line-height: 1.5;">کاربر گرامی، درخواست بازیابی رمز عبور برای حساب کاربری شما دریافت شد.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <p style="font-size: 14px; margin: 0;">کد بازیابی رمز عبور شما:</p>
          <h3 style="margin: 10px 0; font-size: 24px; letter-spacing: 2px;">${data.code}</h3>
          <p style="font-size: 13px; margin: 5px 0 0; color: #777;">این کد تا ۱۵ دقیقه معتبر است.</p>
        </div>
        <p style="font-size: 14px; color: #666; text-align: right;">اگر شما درخواست بازیابی رمز عبور نداده‌اید، لطفاً این ایمیل را نادیده بگیرید.</p>
        <div style="margin-top: 30px; border-top: 1px solid #eaeaea; padding-top: 15px; text-align: center; font-size: 12px; color: #999;">
          <p>شرکت فرابک | این ایمیل به صورت خودکار ارسال شده است، لطفاً به آن پاسخ ندهید.</p>
        </div>
      </div>
    `,
  }),
  test: () => ({
    subject: "تست ارسال ایمیل | فرابک",
    text: "این یک ایمیل تست است.",
    html: `
      <div dir="rtl" style="font-family: Tahoma, Arial; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">تست ارسال ایمیل</h2>
        <p style="font-size: 16px; line-height: 1.5; text-align: center;">این یک ایمیل تست است.</p>
      </div>
    `,
  }),
};

export async function POST(req: Request) {
  const { to, subject, text, html, template, templateData } = await req.json();

  // Handle template-based emails
  if (template && templates[template]) {
    const templateContent = templates[template](templateData || {});

    const mailOptions = {
      from: `"فرابک" <${process.env.MAIL_FROM || "noreply@farabak.net"}>`,
      to,
      subject: templateContent.subject,
      text: templateContent.text,
      html: templateContent.html,
      headers: {
        "x-liara-tag": template, // Tag for tracking in Liara
      },
    };

    try {
      await transporter.sendMail(mailOptions);
      return NextResponse.json({ message: "Email sent successfully" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return NextResponse.json(
          { error: "Failed to send email", details: error.message },
          { status: 500 }
        );
      } else {
        return NextResponse.json(
          { error: "Failed to send email", details: "Unknown error" },
          { status: 500 }
        );
      }
    }
  }

  // Handle regular emails
  if (!to || !subject || (!text && !html)) {
    return NextResponse.json(
      { error: "Please provide to, subject, and either text or html content" },
      { status: 400 }
    );
  }

  const mailOptions = {
    from: `"فرابک" <${process.env.MAIL_FROM || "noreply@farabak.net"}>`,
    to,
    subject,
    text,
    html: html || undefined,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Failed to send email", details: error.message },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: "Failed to send email", details: "Unknown error" },
        { status: 500 }
      );
    }
  }
}
