import { ArrowDownLeft, ArrowLeft, ArrowUpLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { HISTORY_START_YEAR } from "@/content/homepage-proof";
import { landingAssets } from "@/content/landing-assets";
import { landingStories } from "@/content/landing-stories";

import styles from "./landing.module.css";

const startYear = new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(HISTORY_START_YEAR);

/** A complete, navigable first frame before the optional range-focus enhancement mounts. */
export default function ProductRangeHero() {
  const poster = landingAssets.xray;

  return (
    <section className={`${styles.hero} ${styles.productRangeHero}`} aria-labelledby="home-heading">
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" /> فرابک | راهنمای انتخاب تجهیزات
          </p>
          <h1 id="home-heading">از تصویر تا بازرسی، دقیق ببینید.</h1>
          <p className={styles.heroDescription}>
            با مسیر انتخاب تجهیزات نظارت، بازرسی، تولید تصویر و نمایش برای نیاز واقعی پروژه‌تان آشنا
            شوید. از بررسی گزینه‌ها تا پشتیبانی، فرابک کنار شماست.
          </p>
          <div className={styles.actions}>
            <a className={styles.primaryButton} href="#product-stories">
              کاوش محصولات
              <ArrowDownLeft size={19} aria-hidden="true" />
            </a>
            <Link className={styles.secondaryButton} href="/contact-us">
              مشاوره پروژه
              <ArrowLeft size={18} aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.heroHistory}>
            <span className={styles.historyYear}>از {startYear}</span>
            <span className={styles.historyDescription}>سابقه ثبت و فعالیت فرابک</span>
            <Link href="/about-us/activity" aria-label="آشنایی با سابقه و فعالیت فرابک">
              <ArrowUpLeft size={22} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <figure className={`${styles.heroArtwork} ${styles.rangeHeroArtwork}`}>
          <picture>
            {poster.mobileSrc && (
              <source
                media="(max-width: 767px)"
                srcSet={poster.mobileSrc}
                type="image/webp"
                width={800}
                height={1000}
              />
            )}
            {poster.desktopSrc ? (
              <Image
                src={poster.desktopSrc}
                alt={poster.alt}
                width={1600}
                height={900}
                sizes="(max-width: 767px) 100vw, 54vw"
                loading="eager"
                fetchPriority="high"
                style={{ width: "100%", height: "auto" }}
              />
            ) : (
              <span className={styles.rangeMediaFallback}>فضای انتخاب تجهیزات بازرسی</span>
            )}
          </picture>
          <figcaption className={styles.rangeHeroCaption}>
            <span>
              {poster.mediaStatus === "generated-conceptual" ? "تصویر مفهومی" : "تصویر محصول"}
            </span>
            {poster.mediaStatus === "generated-conceptual" && (
              <span>نمونه‌ای از فضای کاربرد؛ تصویر دستگاه واقعی نیست.</span>
            )}
          </figcaption>
        </figure>
      </div>
      <nav className={styles.rangeNav} aria-label="پنج حوزه برای بررسی و مشاوره">
        <ol className={styles.rangeList}>
          {landingStories.map((story, index) => (
            <li key={story.key}>
              <a href={`#story-${story.key}`}>
                <span aria-hidden="true">{new Intl.NumberFormat("fa-IR").format(index + 1)}</span>
                <span>{story.eyebrow}</span>
                <ArrowDownLeft size={16} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </section>
  );
}
