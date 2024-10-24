// app/auth/layout.tsx

import styles from "./AuthLayout.module.css";

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
