import { ArrowDownLeft, ArrowLeft, ArrowUpLeft } from "lucide-react";
import Link from "next/link";

import { HISTORY_START_YEAR } from "@/content/homepage-proof";
import { landingAssets, type LandingAsset } from "@/content/landing-assets";
import { landingStories } from "@/content/landing-stories";

import styles from "./landing.module.css";
import ProductRangeFocus from "./ProductRangeFocus";

const startYear = new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(HISTORY_START_YEAR);

function rangeMedia(asset: LandingAsset) {
  if (asset.mediaStatus === "pending-media") {
    return { mediaStatus: asset.mediaStatus, desktopSrc: null, mobileSrc: null } as const;
  }
  return {
    mediaStatus: asset.mediaStatus,
    desktopSrc: asset.desktopSrc,
    mobileSrc: asset.mobileSrc,
  };
}

/** A complete, navigable first frame before the optional range-focus enhancement mounts. */
export default function ProductRangeHero() {
  const items = landingStories.map((story) => {
    const asset = landingAssets[story.key];
    return {
      key: story.key,
      familyLabel: story.familyLabel,
      eyebrow: story.eyebrow,
      href: `#story-${story.key}`,
      alt: asset.alt,
      ...rangeMedia(asset),
    };
  });

  return (
    <section className={`${styles.hero} ${styles.productRangeHero}`} aria-labelledby="home-heading">
      <ProductRangeFocus items={items}>
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
      </ProductRangeFocus>
    </section>
  );
}
