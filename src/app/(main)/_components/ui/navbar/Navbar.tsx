import Link from "next/link";

import HeaderSubMenu from "./HeaderSubMenu";
import ProductsMegaMenu from "../productsMegaMenu/ProductsMegaMenu";

interface SubMenuItem {
  id: number;
  title: string;
  link: string;
}

interface MenuItem {
  id: number;
  title: string;
  link: string;
  subMenu?: SubMenuItem[];
}

const headerSubMenuData: MenuItem[] = [
  {
    id: 1,
    title: "پشتیبانی",
    link: "/support",
    subMenu: [
      { id: 1, title: "بلاگ", link: "/support/blog" },
      { id: 2, title: "پیگیری گارانتی", link: "/support/warranty-tracking" },
      {
        id: 3,
        title: "نرم‌افزارها و آپدیت‌ها",
        link: "/support/download-center",
      },
      { id: 4, title: "سوالات متداول", link: "/support/faq" },
    ],
  },
  {
    id: 2,
    title: "درباره ما",
    link: "/about-us",
    subMenu: [
      { id: 1, title: "گالری تصاویر پروژه‌ها", link: "/about-us/projects" },
      { id: 2, title: "اعضای هیئت مدیره", link: "/about-us/members" },
      { id: 3, title: "فعالیت شرکت", link: "/about-us/activity" },
    ],
  },
];

const NavBar = () => {
  return (
    <ul className="relative m-0 mx-auto hidden w-[60%] list-none items-center justify-evenly text-[1.1rem] font-bold lg:flex">
      <ProductsMegaMenu />

      {headerSubMenuData.map((item) => (
        <HeaderSubMenu data={item} key={item.id} />
      ))}

      <li className="relative">
        <Link
          href="/contact-us"
          className="inline-block rounded-lg px-8 py-3 text-[#ddd] transition-colors duration-300 hover:bg-[#6363634d]"
        >
          تماس با ما
        </Link>
      </li>
    </ul>
  );
};

export default NavBar;
