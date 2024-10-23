import styles from "./NavBar.module.css";
import ProductsMegaMenu from "../productsMegaMenu/ProductsMegaMenu";
import Link from "next/link";
import HeaderSubMenu from "./HeaderSubMenu";

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

const NavBar = () => {
  const headerSubMenuData: MenuItem[] = [
    {
      id: 1,
      title: "پشتیبانی",
      link: "/support",
      subMenu: [
        { id: 1, title: "بخش آموزش", link: "/support/training-section" },
        {
          id: 2,
          title: "نرم‌افزارها و آپدیت‌ها",
          link: "/support/download-center",
        },
        { id: 3, title: "سوالات متداول", link: "/support/faq" },
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
  return (
    <ul className={styles.nav_ul}>
      <ProductsMegaMenu />

      {headerSubMenuData.map((item) => (
        <HeaderSubMenu data={item} key={item.id} />
      ))}

      <li className={styles.nav_item}>
        <Link href="/contact-us">تماس با ما</Link>
      </li>
    </ul>
  );
};

export default NavBar;
