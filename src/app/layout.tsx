import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";
import { InvoiceProvider } from "@/context/InvoiceContext";
import { UserProvider } from "@/context/UserContext";

// Importing the custom iran yekan font
const iranYekanFont = localFont({
  src: "./fonts/IRANYekanXVF.woff",
  variable: "--font-iran-yekan", // Define a CSS variable for the font
  weight: "100 1000", // Specify the range of font weights
  display: "swap", // Optional: To improve performance, use 'swap' display behavior
});

export const metadata: Metadata = {
  title: "خرید محصولات نظارتی و امنیتی با گارانتی معتبر | فرابک",
  description:
    "فرابک ارائه‌دهنده انواع محصولات نظارتی و امنیتی شامل دوربین مداربسته ریولینک با گارانتی معتبر، تضمین اصالت کالا و خدمات پس از فروش حرفه‌ای.",
  openGraph: {
    title: "خرید محصولات نظارتی و امنیتی با گارانتی معتبر | فرابک",
    description:
      "فرابک ارائه‌دهنده انواع محصولات نظارتی و امنیتی شامل دوربین مداربسته ریولینک با گارانتی معتبر، تضمین اصالت کالا و خدمات پس از فروش حرفه‌ای.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${iranYekanFont.variable}`}>
        <UserProvider>
          <InvoiceProvider>{children}</InvoiceProvider>
        </UserProvider>
      </body>
    </html>
  );
}
