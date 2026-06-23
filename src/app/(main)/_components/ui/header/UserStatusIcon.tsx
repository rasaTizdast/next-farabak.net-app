"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PiUserCircleDashedFill } from "react-icons/pi"; // Icons remain the same

import { useUser } from "@/context/UserContext"; // Access the context directly

import styles from "./Header.module.css"; // CSS module remains unchanged
import UserDropDown from "../userDropDown/UserDropDown";

const UserStatusIcon = () => {
  const router = useRouter();
  const { isLoggedIn } = useUser();

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
