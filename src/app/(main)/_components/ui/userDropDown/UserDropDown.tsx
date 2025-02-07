import { useState, useEffect, useRef } from "react";
import { PiUserCircleDashedFill } from "react-icons/pi";
import Link from "next/link";
import styles from "./UserDropDown.module.css";
import { useUser } from "@/context/UserContext";
// import { useAuth } from "../hooks/useAuth";

const UserDropDown = () => {
  const [isVis, setIsVis] = useState(false);
  const { isAdmin, logout } = useUser();

  const dropdownRef = useRef<HTMLUListElement | null>(null); // Ref to track the dropdown element
  const iconRef = useRef<HTMLDivElement | null>(null); // Ref to track the icon element

  // Function to handle clicks outside the component
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) && // Click is outside the dropdown menu
      iconRef.current &&
      !iconRef.current.contains(event.target as Node) // Click is outside the icon
    ) {
      setIsVis(false); // Close the submenu
    }
  };

  useEffect(() => {
    // Add event listener when the component mounts
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Clean up the event listener when the component unmounts
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={iconRef} className={styles.userIcon}>
      <PiUserCircleDashedFill
        onClick={() => setIsVis((v) => !v)} // Toggle the submenu when clicking the icon
      />
      {isVis && (
        <ul
          className={styles.subMenu}
          ref={dropdownRef}
          onClick={() => setIsVis((v) => !v)}
        >
          {isAdmin && (
            <li>
              <Link href="/admin">پنل مدیریت</Link>
            </li>
          )}
          {!isAdmin && (
            <li>
              <Link href="/dashboard">پروفایل</Link>
            </li>
          )}
          {!isAdmin && (
            <li>
              <Link href="/dashboard/all-invoices">فاکتور‌ها</Link>
            </li>
          )}
          {!isAdmin && (
            <li>
              <Link href="/dashboard/edit-user">ویرایش اطلاعات</Link>
            </li>
          )}
          <li onClick={() => logout()}>خروج از حساب</li>
        </ul>
      )}
    </div>
  );
};

export default UserDropDown;
