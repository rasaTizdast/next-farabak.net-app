import { io } from "next/cache";
import Image from "next/image";

import Link from "@/components/NoPrefetchLink";
import { PublicShell } from "@/components/public/PublicShell";
import { fetchMenuCategories } from "@/helpers/menuHelpers";

import UserStatusIcon from "./UserStatusIcon";
import HamburgerMenu from "../hambugerMenu/HamburgerMenu";
import NavBar from "../navbar/Navbar";
import SearchBox from "../searchBox/SearchBox";

const Header = async () => {
  // The shared menu is retried at request time if the database is unavailable.
  await io();
  const categories = await fetchMenuCategories();

  return (
    <header className="sticky top-0 z-6 min-h-20 w-full bg-[#000814] py-4 transition-shadow duration-300 hover:shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
      <PublicShell className="flex min-h-12 items-center justify-between gap-3 transition-colors duration-300">
        <HamburgerMenu categories={categories} />
        <Link
          href="/"
          aria-label="صفحه اصلی فرابک"
          className="inline-flex shrink-0 rounded-sm focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:ring-offset-2 focus-visible:ring-offset-[#000814] focus-visible:outline-none"
        >
          <Image
            className="mb-2 w-[110%] max-w-[180px] cursor-pointer max-lg:mb-0"
            src="/Farabak_Logo.webp"
            alt="Farabak logo"
            width={150}
            height={40}
            loading="lazy"
            fetchPriority="low"
            sizes="180px"
          />
        </Link>
        <NavBar />
        <UserStatusIcon />
        <SearchBox />
      </PublicShell>
    </header>
  );
};

export default Header;
