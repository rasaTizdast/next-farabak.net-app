"use client";

import Link from "next/link";
import { useState } from "react";

import styles from "./NavBar.module.css";

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

interface HeaderSubMenuProps {
  data: MenuItem;
}

const HeaderSubMenu = ({ data }: HeaderSubMenuProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <li
      className={styles.nav_item}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={data.link}>{data.title}</Link>
      <ul className={hovered ? styles.submenu : styles.hidden}>
        {data.subMenu?.map((item) => (
          <li key={item.id}>
            <Link href={item.link}>{item.title}</Link>
          </li>
        ))}
      </ul>
    </li>
  );
};

export default HeaderSubMenu;
