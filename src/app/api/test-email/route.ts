import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "آدرس ایمیل الزامی است" },
        { status: 400 }
      );
    }

    // Send a test email
    try {
      const response = await fetch(`${process.env.BASE_URL}/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          template: "test",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json(
          { error: errorData.error || "خطا در ارسال ایمیل" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: "ایمیل تست با موفقیت ارسال شد",
        emailSent: true,
      });
    } catch (error) {
      console.error("Error sending test email:", error);
      return NextResponse.json(
        { error: "خطا در ارسال ایمیل" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in test-email endpoint:", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
