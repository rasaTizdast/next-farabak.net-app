import Image from "next/image";
import Link from "next/link";

import UserStatusIcon from "./UserStatusIcon";
import HamburgerMenu from "../hambugerMenu/HamburgerMenu";
import NavBar from "../navbar/Navbar";
import SearchBox from "../searchBox/SearchBox";

const Header = () => {
  return (
    <header className="sticky top-0 z-6 w-full bg-[#000814] px-0 py-4 transition-shadow duration-300 hover:shadow-[0_4px_10px_rgba(0,0,0,0.1)] md:px-40 md:hover:shadow-none lg:px-24 xl:px-16 2xl:px-[10rem]">
      <div className="mx-auto flex w-full max-w-[calc(1900px-20rem)] items-center justify-between transition-colors duration-300">
        <HamburgerMenu />
        <Link href="/" passHref>
          <Image
            className="mb-2 w-[110%] max-w-[180px] cursor-pointer md:mb-0"
            src="/Farabak_Logo.webp"
            alt="Farabak logo"
            width={150}
            height={40}
            loading="lazy"
            fetchPriority="low"
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
