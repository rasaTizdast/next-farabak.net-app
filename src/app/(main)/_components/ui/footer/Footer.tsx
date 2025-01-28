import Link from "next/link";
import { BsFillSignpostSplitFill } from "react-icons/bs";
import { FaInstagram, FaPhoneSquare, FaWhatsapp } from "react-icons/fa";
import styles from "./Footer.module.css";

const Footer = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/contact-us`,
    {
      cache: "force-cache", // Ensure the data is always fresh
    }
  );
  const { phone_numbers, address } = await response.json();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerRow}>
          <div className={styles.detailColumn}>
            <h4 className={styles.cTitle}>صفحات اصلی</h4>
            <div className={styles.cItems}>
              <Link href="/" className={styles.cItem}>
                صفحه اصلی
              </Link>
              <Link href="/products" className={styles.cItem}>
                محصولات
              </Link>
              <Link href="/about-us" className={styles.cItem}>
                درباره ما
              </Link>
            </div>
          </div>
          <div className={styles.detailColumn}>
            <h4 className={styles.cTitle}>
              <Link href="/support">پشتیبانی</Link>
            </h4>
            <div className={styles.cItems}>
              <Link href="/support/training-section" className={styles.cItem}>
                بخش آموزش
              </Link>
              <Link href="/support/download-center" className={styles.cItem}>
                نرم‌افزارها و آپدیت‌ها
              </Link>
              <Link href="/support/faq" className={styles.cItem}>
                سوالات متداول
              </Link>
            </div>
          </div>
          <div className={styles.detailColumn}>
            <h4 className={styles.cTitle}>
              <Link href="/about-us">شرکت فرابک</Link>
            </h4>
            <div className={styles.cItems}>
              <Link href="/about-us/projects" className={styles.cItem}>
                پروژه‌ها
              </Link>
              <Link href="/about-us/activity" className={styles.cItem}>
                فعالیت شرکت
              </Link>
              <Link href="/about-us/members" className={styles.cItem}>
                اعضای هیئت مدیره
              </Link>
            </div>
          </div>
          <div className={styles.detailColumn}>
            <h4 className={styles.cTitle}>شبکه‌های مجازی</h4>
            <div className={styles.cItems}>
              <Link
                target="_blank"
                href="https://www.instagram.com/farabak_cctv"
                className={styles.cItem}
              >
                <FaInstagram />
                اینستاگرام
              </Link>
              <Link href="https://wa.me/989121007066" className={styles.cItem}>
                <FaWhatsapp />
                واتس‌آپ
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.footerRow}>
          <div className={styles.addressParent}>
            <div className={styles.cTitle}>آدرس دفتر مرکزی</div>
            {address && (
              <>
                <div className={`${styles.cItem} ${styles.address}`}>
                  {address.address}
                </div>
                <div className={styles.details}>
                  <div className={`${styles.cItem} ${styles.addressItem}`}>
                    <BsFillSignpostSplitFill />
                    <span>{address.postal_code}</span>
                  </div>
                  {phone_numbers.map((phone) => (
                    <div
                      key={phone.id}
                      className={`${styles.cItem} ${styles.addressItem}`}
                    >
                      <FaPhoneSquare />
                      <Link href={`tel:${phone.number}`}>{phone.number}</Link>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1360.8932132644327!2d51.35469992463351!3d35.78108017399431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f8e07b684c2b9d5%3A0x703fbc3293eb71d6!2sFARABAK%20Head%20Office%20Company!5e0!3m2!1sen!2s!4v1711904970824!5m2!1sen!2s"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className={styles.map}
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
