import Link from "next/link"; // Next.js Link
import Image from "next/image"; // Next.js Image

import HamburgerMenu from "../hambugerMenu/HamburgerMenu";

// import farabakLogo from "/public/Farabak_Logo.webp"; // Adjusted logo import for Next.js

import NavBar from "../navbar/Navbar";
import UserStatusIcon from "./UserStatusIcon";
import SearchBox from "../searchBox/SearchBox";

import styles from "./Header.module.css"; // CSS module remains unchanged

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.header_content}>
        <HamburgerMenu />
        <Link href="/" passHref>
          <Image
            loading="eager"
            priority
            className={styles.header_logo}
            src="/Farabak_Logo.webp"
            alt="Farabak logo"
            width={150}
            height={40}
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
