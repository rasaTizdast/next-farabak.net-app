"use client";

import { useRouter } from "next/navigation";
import { PiUserCircleDashedFill } from "react-icons/pi"; // Icons remain the same
import UserDropDown from "../userDropDown/UserDropDown";
import styles from "./Header.module.css"; // CSS module remains unchanged
import { useUser } from "@/context/UserContext"; // Access the context directly

const UserStatusIcon = () => {
  const router = useRouter();
  const { isLoggedIn } = useUser(); // Use the user context

  return (
    <div className={styles.icons}>
      {isLoggedIn ? (
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
