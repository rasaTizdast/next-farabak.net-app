import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import { InvoiceProvider } from "@/context/InvoiceContext";

// Importing the custom Vazirmatn font
const vazirmatnFont = localFont({
  src: "./fonts/Vazirmatn-VariableFont_wght.ttf",
  variable: "--font-vazirmatn", // Define a CSS variable for the font
  weight: "100 900", // Specify the range of font weights
  display: "swap", // Optional: To improve performance, use 'swap' display behavior
});

export const metadata: Metadata = {
  title: "پیشرو در تکنولوژی | فرابک",
  description: "پیشرو در تکنولوژی و نوآوری های فرابک با محصولات و خدمات متنوع.",
  icons: "/Farabak_FavIcon.webp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazirmatnFont.variable}`}>
        <UserProvider>
          <InvoiceProvider>{children}</InvoiceProvider>
        </UserProvider>
      </body>
    </html>
  );
}
