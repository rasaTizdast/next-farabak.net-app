"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

import { Divide } from "hamburger-react";
import { PiUserCircleDashedFill } from "react-icons/pi";
import { IoIosArrowRoundBack } from "react-icons/io";

import styles from "./HamburgerMenu.module.css";
import { useUser } from "@/context/UserContext";

const HamburgerMenu = () => {
  const [isOpen, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const { isLoggedIn, isAdmin } = useUser(); // Use the user context
  const [userLoggedIn, setUserLoggedIn] = useState(isLoggedIn);

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add(styles.noScroll);
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.body.classList.remove(styles.noScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.body.classList.remove(styles.noScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Re-render when the isLoggedIn value changes in context
  useEffect(() => {
    setUserLoggedIn(isLoggedIn);
  }, [isLoggedIn]);

  return (
    <div className={`${styles.container}`} ref={menuRef}>
      <Divide
        toggled={isOpen}
        toggle={setOpen}
        size={34}
        color="#fff"
        easing="ease-in-out"
        duration={0.3}
        rounded
        hideOutline={true}
      />

      {isOpen && (
        <div
          className={`${styles.overlay} ${isOpen ? styles.show : ""}`}
          onClick={() => setOpen(false)}
        />
      )}

      <div className={`${styles.menu} ${isOpen ? styles.open : ""}`}>
        <div className={`${styles.items} ${isOpen ? styles.show : ""}`}>
          <Link onClick={() => setOpen(false)} href="/products">
            <span>محصولات</span>
            <IoIosArrowRoundBack />
          </Link>
          <Link onClick={() => setOpen(false)} href="/support">
            <span>پشتیبانی</span>
            <IoIosArrowRoundBack />
          </Link>
          <Link onClick={() => setOpen(false)} href="/about-us">
            <span>درباره‌ما</span>
            <IoIosArrowRoundBack />
          </Link>
          <Link onClick={() => setOpen(false)} href="/contact-us">
            <span>تماس با ما</span>
            <IoIosArrowRoundBack />
          </Link>
        </div>

        {/* sign-in or sign-up button */}
        {userLoggedIn ? (
          isAdmin ? (
            <Link
              onClick={() => setOpen(false)}
              href="/admin"
              className={`${styles.user_icon} ${isOpen ? styles.show : ""}`}
            >
              <PiUserCircleDashedFill fill="#0e6aff" />
              <p>ورود به پنل ادمین</p>
            </Link>
          ) : (
            <Link
              onClick={() => setOpen(false)}
              href="/dashboard"
              className={`${styles.user_icon} ${isOpen ? styles.show : ""}`}
            >
              <PiUserCircleDashedFill fill="#0e6aff" />
              <p>ورود به پنل کاربری</p>
            </Link>
          )
        ) : (
          <Link
            onClick={() => setOpen(false)}
            href="/auth/signup"
            className={`${styles.signup} ${isOpen ? styles.show : ""}`}
          >
            <button>ورود / ثبت‌نام</button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default HamburgerMenu;
