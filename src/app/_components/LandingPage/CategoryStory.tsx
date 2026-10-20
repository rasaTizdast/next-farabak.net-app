import { ArrowLeft, ArrowUpLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { landingAssets } from "@/content/landing-assets";
import type { LandingStory } from "@/content/landing-stories";

import styles from "./landing.module.css";

type Props = { story: LandingStory; index: number };

/** Each chapter keeps its meaning, links, and media visible without client JavaScript. */
export default function CategoryStory({ story, index }: Props) {
  const media = landingAssets[story.key];
  const knowledgeHref =
    story.categoryHref === story.action.href ? "/support/blog" : story.categoryHref;
  const knowledgeLabel =
    story.categoryHref === story.action.href ? "خواندن راهنماهای انتخاب" : "شناخت بیشتر این دسته";

  return (
    <section
      id={`story-${story.key}`}
      className={`${styles.categoryStory} ${styles[`story${index + 1}`]}`}
      data-story={story.key}
      data-layout={story.layout}
      aria-labelledby={`story-${story.key}-heading`}
    >
      <div className={styles.container}>
        <div className={styles.storyFrame}>
          <div className={styles.storyCopy}>
            <p className={styles.sectionEyebrow}>
              <span aria-hidden="true">{new Intl.NumberFormat("fa-IR").format(index + 1)} / ۵</span>
              <bdi lang="en" dir="ltr">
                {story.familyLabel}
              </bdi>
              <span>{story.eyebrow}</span>
            </p>
            <h2 id={`story-${story.key}-heading`}>{story.title}</h2>
            <p className={styles.storyIntroduction}>{story.introduction}</p>
            <p className={styles.storySolution}>
              {story.solution.beforeModel}
              {story.solution.modelName && (
                <bdi lang="en" dir="ltr">
                  {story.solution.modelName}
                </bdi>
              )}
              {story.solution.afterModel}
            </p>
            <div className={styles.storyFactors}>
              <h3>پیش از انتخاب بررسی کنید</h3>
              <ul>
                {story.factors.map((factor) => (
                  <li key={factor}>{factor}</li>
                ))}
              </ul>
            </div>
            <p className={styles.storySelectionPrompt}>{story.selectionPrompt}</p>
            <div className={styles.actions}>
              <Link className={styles.primaryButton} href={story.action.href}>
                <span>
                  {story.action.label}
                  {story.action.modelName && (
                    <>
                      {" "}
                      <bdi lang="en" dir="ltr">
                        {story.action.modelName}
                      </bdi>
                    </>
                  )}
                </span>
                <ArrowUpLeft size={18} aria-hidden="true" />
              </Link>
              <Link className={styles.storyKnowledgeLink} href={knowledgeHref}>
                {knowledgeLabel}
                <ArrowLeft size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <figure className={styles.storyMedia}>
            {media.desktopSrc ? (
              <picture>
                {media.mobileSrc && (
                  <source
                    media="(max-width: 767px)"
                    srcSet={media.mobileSrc}
                    type="image/webp"
                    width={800}
                    height={1000}
                  />
                )}
                <Image
                  src={media.desktopSrc}
                  alt={media.alt}
                  width={1600}
                  height={900}
                  sizes="(max-width: 767px) 100vw, (max-width: 1023px) 88vw, 58vw"
                  style={{ width: "100%", height: "auto" }}
                />
              </picture>
            ) : (
              <div
                className={styles.storyMediaFallback}
                role="img"
                aria-label={`جای تصویر برای ${story.eyebrow}`}
              >
                {story.eyebrow}
              </div>
            )}
            <figcaption className={styles.storyMediaCaption}>
              <span>
                {media.mediaStatus === "generated-conceptual" ? story.mediaLabel : "تصویر محصول"}
              </span>
              {media.mediaStatus === "generated-conceptual" && (
                <span>نمایی از فضای کاربرد، نه تصویر محصول یا پروژه واقعی فرابک.</span>
              )}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
