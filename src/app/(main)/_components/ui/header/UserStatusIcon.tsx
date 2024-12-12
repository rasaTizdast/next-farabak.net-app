"use client";

import { useRouter } from "next/navigation";
import { PiUserCircleDashedFill } from "react-icons/pi"; // Icons remain the same
import UserDropDown from "../userDropDown/UserDropDown";
import { useUser } from "@/context/UserContext"; // Access the context directly
import { useEffect, useState } from "react"; // Import useEffect and useState for state management
import styles from "./Header.module.css"; // CSS module remains unchanged

const UserStatusIcon = () => {
  const router = useRouter();
  const { isLoggedIn } = useUser(); // Use the user context
  const [userLoggedIn, setUserLoggedIn] = useState(isLoggedIn);

  // Re-render when the isLoggedIn value changes in context
  useEffect(() => {
    setUserLoggedIn(isLoggedIn);
  }, [isLoggedIn]);

  return (
    <div className={styles.icons}>
      {userLoggedIn ? (
        <UserDropDown />
      ) : (
        <div className={styles.userIcon}>
          <PiUserCircleDashedFill onClick={() => router.push("/auth/signup")} />
        </div>
      )}
    </div>
  );
};

export default UserStatusIcon;
