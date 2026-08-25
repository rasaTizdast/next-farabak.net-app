"use client";

import { Divide } from "hamburger-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { PiUserCircleDashedFill } from "react-icons/pi";

import { useUser } from "@/context/UserContext";

const HamburgerMenu = () => {
  const [isOpen, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const { isLoggedIn, isAdmin } = useUser();

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.body.style.overflow = "";
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
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
        <button
          type="button"
          className={`fixed start-0 top-[80px] z-[3] h-[calc(100vh-80px)] w-full bg-black/50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
          aria-label="بستن منو"
        />
      )}

      <div
        className={`absolute -end-[650%] top-[133%] z-[4] flex h-[calc(100dvh-80px)] w-[280px] flex-col justify-between bg-[#dddddd] p-4 transition-[inset-inline-end] duration-300 md:pe-6 ${isOpen ? "-end-[50%]" : ""}`}
      >
        <div
          className={`flex translate-x-full transform flex-col gap-8 opacity-0 transition-[transform,opacity] delay-300 duration-300 ${isOpen ? "translate-x-0 opacity-100" : ""}`}
        >
          <Link
            onClick={() => setOpen(false)}
            href="/products"
            className="flex w-full items-center justify-between"
          >
            <span>محصولات</span>
            <IoIosArrowRoundBack />
          </Link>
          <Link
            onClick={() => setOpen(false)}
            href="/support"
            className="flex w-full items-center justify-between"
          >
            <span>پشتیبانی</span>
            <IoIosArrowRoundBack />
          </Link>
          <Link
            onClick={() => setOpen(false)}
            href="/about-us"
            className="flex w-full items-center justify-between"
          >
            <span>درباره‌ما</span>
            <IoIosArrowRoundBack />
          </Link>
          <Link
            onClick={() => setOpen(false)}
            href="/contact-us"
            className="flex w-full items-center justify-between"
          >
            <span>تماس با ما</span>
            <IoIosArrowRoundBack />
          </Link>
        </div>

        {/* sign-in or sign-up button */}
        {isLoggedIn ? (
          isAdmin ? (
            <Link
              onClick={() => setOpen(false)}
              href="/admin"
              className={`flex translate-x-full transform items-center justify-start gap-4 opacity-0 transition-[transform,opacity] delay-300 duration-300 ${isOpen ? "translate-x-0 opacity-100" : ""}`}
            >
              <PiUserCircleDashedFill fill="#0e6aff" className="text-[2rem]" />
              <p>ورود به پنل ادمین</p>
            </Link>
          ) : (
            <Link
              onClick={() => setOpen(false)}
              href="/dashboard"
              className={`flex translate-x-full transform items-center justify-start gap-4 opacity-0 transition-[transform,opacity] delay-300 duration-300 ${isOpen ? "translate-x-0 opacity-100" : ""}`}
            >
              <PiUserCircleDashedFill fill="#0e6aff" className="text-[2rem]" />
              <p>ورود به پنل کاربری</p>
            </Link>
          )
        ) : (
          <Link
            onClick={() => setOpen(false)}
            href="/auth/signup"
            className={`flex translate-x-full transform items-center justify-start gap-4 opacity-0 transition-[transform,opacity] delay-300 duration-300 ${isOpen ? "translate-x-0 opacity-100" : ""}`}
          >
            <button
              type="button"
              className="w-full rounded-lg border-none bg-[#318ce7] py-[0.4rem] font-medium text-white"
            >
              ورود / ثبت‌نام
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default HamburgerMenu;
