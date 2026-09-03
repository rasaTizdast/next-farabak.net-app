import Image from "next/image";
import Link from "next/link";

import { fetchMenuCategories } from "@/helpers/menuHelpers";

import UserStatusIcon from "./UserStatusIcon";
import HamburgerMenu from "../hambugerMenu/HamburgerMenu";
import NavBar from "../navbar/Navbar";
import SearchBox from "../searchBox/SearchBox";

const Header = async () => {
  const categories = await fetchMenuCategories();

  return (
    <header className="sticky top-0 z-6 w-full bg-[#000814] px-6 py-4 transition-shadow duration-300 hover:shadow-[0_4px_10px_rgba(0,0,0,0.1)] min-[992px]:px-16 min-[1200px]:px-24 md:px-12 2xl:px-40">
      <div className="mx-auto flex w-full max-w-[1580px] items-center justify-between gap-3 transition-colors duration-300">
        <HamburgerMenu categories={categories} />
        <Link href="/" passHref>
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
      </div>
    </header>
  );
};

export default Header;
