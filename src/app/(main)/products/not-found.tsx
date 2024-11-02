import Image from "next/image";
import Link from "next/link";

import styles from "./not-found.module.css";

const NotFound = () => {
  return (
    <div className={styles.nf_cont}>
      <h1>محصولی یافت نشد !!!</h1>
      <Link href="/">برگشت به صفحه اصلی</Link>
      <Image src="/404.png" alt="" width={1366} height={666} quality={100} />
    </div>
  );
};

export default NotFound;
