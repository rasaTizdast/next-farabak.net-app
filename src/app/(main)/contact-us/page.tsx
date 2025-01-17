export const dynamic = "force-dynamic";

import { Metadata } from "next";
import styles from "./ContactUsPage.module.css";

export const metadata: Metadata = {
  title: "تماس با ما | فرابک",
  description:
    "راه های تماس با شرکت فرابک را میتوانید از این صفحه مشاهده کنید..",
};

const ContactUsPage = () => {
  return (
    <main className={styles.main}>
      <div className={styles.section}>
        <h1>آدرس</h1>
        <div className={styles.para}>
          <div className={styles.bold}>آدرس:</div>
          سعادت آباد، میدان کتاب، خیابان عسگری گراوندی، نبش آسمان هشتم، پلاک 6،
          طبقه همکف
        </div>
        <div className={styles.para}>
          <div className={styles.bold}>کدپستی:</div>
          1458745896
        </div>
        <p>
          لطفا جهت مراجعه به دفتر شرکت فرابک، قبلا هماهنگی لازم را به عمل آورید.
          ساعت مراجعه حضوری: (11 الی 13) و (14 الی 16)
        </p>
      </div>
      <div className={styles.section}>
        <h1>شماره‌های تماس</h1>
        <ul>
          <li>
            <a href="tel:09121258556">09121258556</a>
          </li>
          <li>
            <a href="tel:09121007066">09121007066</a>
          </li>
          <li>
            <a href="tel:09101007066">09101007066</a>
          </li>
          <li>
            <a href="tel:02122089531">021-22089531</a>
          </li>
          <li>
            <a href="tel:02177500008">021-77500008</a>
          </li>
          <li>
            <a href="tel:02122089531">021-22089531</a>
          </li>
        </ul>
      </div>
      <div className={styles.section}>
        <h1>آدرس‌های ایمیل</h1>
        <ul>
          <li>
            <a href="mailto:sale@farabak.net">
              <div className={styles.bold}>فروش:</div>
              <span>Sale@farabak.net</span>
            </a>
          </li>
          <li>
            <a href="mailto:manager@farabak.net">
              <div className={styles.bold}>مدیریت:</div>
              <span>Manager@farabak.net</span>
            </a>
          </li>
          <li>
            <a href="mailto:support@farabak.net">
              <div className={styles.bold}>پشتیبانی:</div>
              <span>Support@farabak.net</span>
            </a>
          </li>
          <li>
            <a href="mailto:info@farabak.net">
              <div className={styles.bold}>اطلاع‌رسانی:</div>
              <span>Info@farabak.net</span>
            </a>
          </li>
        </ul>
      </div>
    </main>
  );
};

export default ContactUsPage;
