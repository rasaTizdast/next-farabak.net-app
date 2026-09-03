import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { Suspense } from "react";

import { defaultMetadata } from "@/constants/meta";
import { InvoiceProvider } from "@/context/InvoiceContext";
import { UserProvider } from "@/context/UserContext";

import "./globals.css";
import { AnalyticsProvider } from "./providers/AnalyticsProvider";
import { WebVitalsProvider } from "./providers/WebVitalsProvider";

// Importing the custom iran yekan font
const iranYekanFont = localFont({
  src: "./fonts/IRANYekanXVF.woff",
  variable: "--font-iran-yekan", // Define a CSS variable for the font
  weight: "100 1000", // Specify the range of font weights
  display: "swap", // Improve performance with font swap
  preload: true, // Preload the font for better performance
  fallback: ["system-ui", "arial"], // Fallback fonts
});

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        {/* Preconnect to image CDN to speed up slider image fetch */}
        {process.env.LIARA_BUCKET_URL && (
          <>
            <link rel="preconnect" href={process.env.LIARA_BUCKET_URL} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={process.env.LIARA_BUCKET_URL} />
          </>
        )}

        {/* Google Analytics Script - lazy load to reduce TBT */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GOOGLE_ANALYTICS_ID}`}
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.GOOGLE_ANALYTICS_ID}');
          `}
        </Script>
      </head>
      <body className={`${iranYekanFont.variable}`}>
        <UserProvider>
          <InvoiceProvider>
            {children}
            <Suspense fallback={null}>
              <AnalyticsProvider />
              <WebVitalsProvider />
            </Suspense>
          </InvoiceProvider>
        </UserProvider>
      </body>
    </html>
  );
}
