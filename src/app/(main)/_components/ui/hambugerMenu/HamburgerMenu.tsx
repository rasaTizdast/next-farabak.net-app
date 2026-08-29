"use client";

import { Divide } from "hamburger-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { PiUserCircleDashedFill } from "react-icons/pi";

import { useUser } from "@/context/UserContext";
import type { MenuCategory } from "@/helpers/menuHelpers";

interface HamburgerMenuProps {
  categories: MenuCategory[];
}

const HamburgerMenu = ({ categories }: HamburgerMenuProps) => {
  const [isOpen, setOpen] = useState(false);
  const [isProductsOpen, setProductsOpen] = useState(false);
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const { isLoggedIn, isAdmin } = useUser();

  const categoriesWithSubcategories = categories.filter((category) =>
    category.Subcategories.some((sub) => sub.Available)
  );

  const categoriesWithoutSubcategories = categories.filter(
    (category) => !category.Subcategories.some((sub) => sub.Available)
  );

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

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const closeMenu = () => {
    setOpen(false);
    setProductsOpen(false);
    setExpandedCategoryId(null);
  };

  const contentVisibilityClass = `transition-[transform,opacity] delay-300 duration-300 ${
    isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
  }`;

  return (
    <div className="relative hidden max-lg:block" ref={menuRef}>
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

      <button
        type="button"
        tabIndex={isOpen ? 0 : -1}
        aria-label="بستن منو"
        aria-hidden={!isOpen}
        className={`fixed inset-s-0 top-[64px] z-3 h-[calc(100vh-64px)] w-full bg-black/60 transition-opacity duration-300 ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMenu}
      />

      <nav
        aria-label="منوی موبایل"
        className={`fixed inset-s-0 top-[64px] z-4 flex h-[calc(100dvh-64px)] w-[290px] flex-col overflow-hidden border-s border-white/10 bg-[#000814] text-[#f5f7fa] transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Products section — expands inline, pushes other links down */}
        <div className={`shrink-0 p-5 pb-0 ${contentVisibilityClass}`}>
          <button
            type="button"
            aria-expanded={isProductsOpen}
            onClick={() => setProductsOpen((value) => !value)}
            className="flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-3 text-base font-bold text-white transition-colors duration-200 hover:bg-white/5"
          >
            <span>محصولات</span>
            <IoIosArrowDown
              className={`text-primary text-lg transition-transform duration-300 ${
                isProductsOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>

          {isProductsOpen && (
            <div
              role="region"
              aria-label="دسته‌بندی محصولات"
              className="mt-1 max-h-[55vh] w-full scrollbar-none overflow-y-auto rounded-xl border border-white/10 bg-[#000814]/95 p-3 shadow-[0_8px_24px_rgba(0,0,0,0.3)] backdrop-blur-sm [&::-webkit-scrollbar]:hidden"
            >
              <ul className="m-0 list-none space-y-1 pb-2">
                <li>
                  <Link
                    href="/products"
                    onClick={closeMenu}
                    className="text-primary block rounded-lg px-3 py-2.5 text-sm font-bold transition-colors duration-200 hover:bg-white/5"
                  >
                    مشاهده همه محصولات
                  </Link>
                </li>

                {categoriesWithSubcategories.map((category) => {
                  const isExpanded = expandedCategoryId === category.CategoryID;
                  return (
                    <li key={category.CategoryID}>
                      <div className="flex items-center justify-between gap-1">
                        <Link
                          href={category.Link}
                          onClick={closeMenu}
                          className="grow rounded-lg px-3 py-2.5 text-sm font-medium text-[#f5f7fa] transition-colors duration-200 hover:bg-white/5"
                        >
                          {category.Name}
                        </Link>
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          aria-label={`نمایش زیرشاخه‌های ${category.Name}`}
                          onClick={() =>
                            setExpandedCategoryId(isExpanded ? null : category.CategoryID)
                          }
                          className="text-primary shrink-0 cursor-pointer rounded-full p-2 transition-colors duration-200 hover:bg-white/10"
                        >
                          <IoIosArrowDown
                            className={`text-base transition-transform duration-300 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                            aria-hidden="true"
                          />
                        </button>
                      </div>

                      <div
                        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <ul className="m-0 me-3 list-none space-y-0.5 border-e border-white/10 p-0 pe-3">
                            {category.Subcategories.filter((sub) => sub.Available).map((sub) => (
                              <li key={sub.CategoryContentId}>
                                <Link
                                  href={sub.Link}
                                  onClick={closeMenu}
                                  className="hover:text-primary block rounded-lg px-3 py-2 text-[0.85rem] text-[#f5f7fa] transition-colors duration-200 hover:bg-white/5"
                                >
                                  {sub.Name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </li>
                  );
                })}

                {categoriesWithoutSubcategories.map((category) => (
                  <li key={category.CategoryID}>
                    <Link
                      href={category.Link}
                      onClick={closeMenu}
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[#f5f7fa] transition-colors duration-200 hover:bg-white/5"
                    >
                      {category.Name}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Bottom gradient mask — fades items into the bg */}
              <div
                className="pointer-events-none sticky bottom-0 -mb-4 h-6 bg-linear-to-t from-[#000814] to-transparent"
                aria-hidden="true"
              />
            </div>
          )}
        </div>

        {/* Other links — pushed down by products panel */}
        <ul className={`m-0 flex shrink-0 list-none flex-col gap-1 p-5 ${contentVisibilityClass}`}>
          <li>
            <Link
              href="/support"
              onClick={closeMenu}
              className="block rounded-lg px-2 py-3 text-base font-bold text-white transition-colors duration-200 hover:bg-white/5"
            >
              پشتیبانی
            </Link>
          </li>
          <li>
            <Link
              href="/about-us"
              onClick={closeMenu}
              className="block rounded-lg px-2 py-3 text-base font-bold text-white transition-colors duration-200 hover:bg-white/5"
            >
              درباره‌ما
            </Link>
          </li>
          <li>
            <Link
              href="/contact-us"
              onClick={closeMenu}
              className="block rounded-lg px-2 py-3 text-base font-bold text-white transition-colors duration-200 hover:bg-white/5"
            >
              تماس با ما
            </Link>
          </li>
        </ul>

        {/* Fixed bottom: auth section — never moves */}
        <div className={`mt-auto shrink-0 border-t border-white/10 p-5 ${contentVisibilityClass}`}>
          {isLoggedIn ? (
            isAdmin ? (
              <Link
                onClick={closeMenu}
                href="/admin"
                className="hover:text-primary flex items-center justify-start gap-3 p-2 transition-colors duration-200"
              >
                <PiUserCircleDashedFill fill="#318ce7" className="text-[2rem]" />
                <p className="m-0">ورود به پنل ادمین</p>
              </Link>
            ) : (
              <Link
                onClick={closeMenu}
                href="/dashboard"
                className="hover:text-primary flex items-center justify-start gap-3 p-2 transition-colors duration-200"
              >
                <PiUserCircleDashedFill fill="#318ce7" className="text-[2rem]" />
                <p className="m-0">ورود به پنل کاربری</p>
              </Link>
            )
          ) : (
            <Link onClick={closeMenu} href="/auth/signup" className="block">
              <span className="bg-secondary block w-full rounded-lg py-2 text-center font-medium text-white transition-opacity duration-200 hover:opacity-90">
                ورود / ثبت‌نام
              </span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
};

export default HamburgerMenu;
