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
    <ul className="mobile:hidden m-0 mx-auto flex w-[60%] list-none items-start justify-evenly self-end text-base font-bold md:text-[0.9rem] lg:text-[1.4vw] xl:text-base 2xl:text-[1.2rem]">
      <ProductsMegaMenu />

      {headerSubMenuData.map((item) => (
        <HeaderSubMenu data={item} key={item.id} />
      ))}

      <li>
        <Link href="/contact-us" className="block">
          تماس با ما
        </Link>
      </li>
    </ul>
  );
};

export default NavBar;
