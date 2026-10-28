import { ArrowDownLeft, ArrowLeft, ArrowUpLeft } from "lucide-react";
import Link from "next/link";

import { HISTORY_START_YEAR } from "@/content/homepage-proof";
import { landingAssets, type LandingAsset } from "@/content/landing-assets";
import { landingStories } from "@/content/landing-stories";

import styles from "./landing.module.css";
import ProductRangeFocus from "./ProductRangeFocus";

const startYear = new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(HISTORY_START_YEAR);

function rangeMedia(asset: LandingAsset) {
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
      categoryLabel: story.categoryLabel,
      href: `#story-${story.key}`,
      alt: asset.alt,
      ...rangeMedia(asset),
    };
  });

  return (
    <section className={`${styles.hero} ${styles.productRangeHero}`} aria-labelledby="home-heading">
      <ProductRangeFocus items={items}>
        <div className={styles.heroCopy}>
          <h1 id="home-heading" data-reveal-order="0">
            <span className={styles.heroHeadlineLine}>
              <span data-reveal-order="0" data-reveal>
                از نیاز پروژه
              </span>
            </span>
            <span className={styles.heroHeadlineLine}>
              <span data-reveal-order="1" data-reveal>
                تا انتخاب دقیق
              </span>
            </span>
          </h1>
          <p className={styles.heroDescription} data-reveal-order="2" data-reveal>
            مسیر انتخاب تجهیزات بازرسی، نظارت و تولید تصویر را با نیاز واقعی پروژه هماهنگ کنید.
          </p>
          <div className={styles.actions} data-reveal-order="3" data-reveal>
            <a className={styles.primaryButton} href="#range-select">
              انتخاب حوزه
              <span className={styles.buttonIcon}>
                <ArrowDownLeft size={19} aria-hidden="true" />
              </span>
            </a>
            <Link className={styles.secondaryButton} href="/contact-us">
              مشاوره پروژه
              <ArrowLeft size={18} aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.heroHistory} data-reveal-order="4" data-reveal>
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
