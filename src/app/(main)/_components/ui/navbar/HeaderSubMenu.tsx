"use client";

import Link from "next/link";
import { useState } from "react";

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
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        href={data.link}
        className="inline-block rounded-t-lg rounded-tr-lg px-4 py-2.5 text-[#ddd] transition-[background-color,padding-inline] duration-300 hover:bg-[#6363634d] hover:px-8 md:hover:px-6 lg:hover:px-4.5 xl:hover:px-8 2xl:hover:px-8"
      >
        {data.title}
      </Link>
      <ul
        className={`absolute -start-[25%] top-full z-1000 m-0 flex w-[150%] flex-col overflow-hidden rounded-br-lg rounded-bl-lg bg-white p-0 shadow-[0_4px_10px_4px_rgba(0,0,0,0.1)] ${
          hovered ? "block" : "hidden"
        }`}
      >
        {data.subMenu?.map((item) => (
          <li
            key={item.id}
            className="border-b border-[#ddd] transition-colors duration-200 last:border-none hover:bg-[#caf2ff]"
          >
            <Link
              href={item.link}
              className="block px-[10px] py-[15px] text-center text-[0.9rem] leading-[1.5] text-[#333] md:text-[1.1rem] 2xl:text-[1.1rem]"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
};

export default HeaderSubMenu;
