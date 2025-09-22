import Image from "next/image"; // Next.js Image
import Link from "next/link"; // Next.js Link

import styles from "./Header.module.css"; // CSS module remains unchanged
import UserStatusIcon from "./UserStatusIcon";
import HamburgerMenu from "../hambugerMenu/HamburgerMenu";
import NavBar from "../navbar/Navbar";
import SearchBox from "../searchBox/SearchBox";

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.header_content}>
        <HamburgerMenu />
        <Link href="/" passHref>
          <Image
            className={styles.header_logo}
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
