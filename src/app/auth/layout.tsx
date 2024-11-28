// app/auth/layout.tsx

import { Metadata } from "next";
import styles from "./AuthLayout.module.css";

export const metadata: Metadata = {
  robots: {
    index: false, // This sets the noindex directive
    follow: false, // Allows crawling of links on the page if needed
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.parent}>
      {children} {/* This renders SignUp or SignIn depending on the route */}
    </div>
  );
}
