import { ArrowLeft, ArrowUpLeft, Building2, ScanLine } from "lucide-react";
import { io } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { Fragment, Suspense } from "react";

import { HISTORY_START_YEAR, homepageTestimonials } from "@/content/homepage-proof";
import { landingStories } from "@/content/landing-stories";
import { getHomepageData, type HomepageData } from "@/lib/data/homepage";
import { publishedTestimonials, resolveHomepageImage } from "@/lib/homepage-proof";

import BlogHighlights from "./BlogHighlights";
import CategoryStory from "./CategoryStory";
import styles from "./landing.module.css";
import LandingExperience from "./LandingExperience";
import ProductRangeHero from "./ProductRangeHero";
import ProductStoryTransition from "./ProductStoryTransition";

const digits = (value: number) =>
  new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(value);
const textOnly = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function SectionHeading({
  title,
  description,
  href,
  linkLabel,
  id,
}: {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  id?: string;
}) {
  return (
    <div className={styles.sectionHeading} data-reveal>
      <div>
        <h2 id={id}>{title}</h2>
        {description && <p className={styles.sectionDescription}>{description}</p>}
      </div>
      {href && (
        <Link className={styles.textLink} href={href}>
          {linkLabel}
          <ArrowUpLeft size={18} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

function EvidenceBand() {
  return (
    <nav className={styles.evidenceBand} aria-label="پشتوانه انتخاب فرابک">
      <div className={styles.container}>
        <Link href="/about-us/activity" data-reveal data-reveal-order="0">
          <span>
            <strong>ریشه‌دار از {digits(HISTORY_START_YEAR)}</strong>
            <small>با سابقه و فعالیت‌های ما آشنا شوید</small>
          </span>
        </Link>
        <Link href="/about-us/projects" data-reveal data-reveal-order="1">
          <span>
            <strong>تجربه‌ای که می‌توان دید</strong>
            <small>پروژه‌ها و نمونه‌کارهای فرابک</small>
          </span>
        </Link>
        <Link href="/support/warranty-tracking" data-reveal data-reveal-order="2">
          <span>
            <strong>پشتیبانی قابل پیگیری</strong>
            <small>دسترسی مستقیم به پیگیری گارانتی</small>
          </span>
        </Link>
      </div>
    </nav>
  );
}

function ProjectsFallback() {
  return (
    <div className={styles.projectFallback} data-reveal>
      <ScanLine size={42} strokeWidth={1.1} aria-hidden="true" />
      <div>
        <h3>پشت هر سیستم، یک نگاه تخصصی است.</h3>
        <p>با فعالیت‌ها، حوزه‌های تخصصی و نمونه‌کارهای فرابک بیشتر آشنا شوید.</p>
      </div>
      <Link className={styles.textLink} href="/about-us/projects">
        مشاهده گالری پروژه‌ها
        <ArrowUpLeft size={18} aria-hidden="true" />
      </Link>
    </div>
  );
}

function ProjectsShowcase({
  projects,
  publishedProjectCount,
}: Pick<HomepageData, "projects" | "publishedProjectCount">) {
  return (
    <section
      className={styles.projectsSection}
      id="published-work"
      aria-labelledby="projects-heading"
    >
      <div className={styles.container}>
        <SectionHeading
          id="projects-heading"
          title="اعتماد، از کارِ انجام‌شده آغاز می‌شود."
          description="برای شناختن ما، از پروژه‌ها و تجربه‌های اجرایی ما شروع کنید."
          href="/about-us/projects"
          linkLabel="همهٔ پروژه‌ها"
        />
        {publishedProjectCount !== null && publishedProjectCount > 0 && (
          <p className={styles.projectCount}>
            {digits(publishedProjectCount)} پروژهٔ معرفی‌شده در گالری فرابک
          </p>
        )}
        {projects.length ? (
          <div className={styles.projectGrid}>
            {projects.map((project, index) => {
              const image = resolveHomepageImage(project.mainImg, process.env.LIARA_BUCKET_URL);
              return (
                <Link
                  key={project.id}
                  href={`/about-us/projects/${encodeURIComponent(project.slug)}`}
                  className={`${styles.projectCard} ${index === 0 ? styles.projectLead : ""}`}
                  data-reveal
                  data-reveal-kind="image"
                >
                  <div className={styles.projectImage}>
                    {image ? (
                      <Image
                        src={image}
                        alt={project.title}
                        fill
                        sizes={
                          index === 0
                            ? "(max-width: 767px) 92vw, (max-width: 1023px) 60vw, 58vw"
                            : "(max-width: 767px) 92vw, 32vw"
                        }
                      />
                    ) : (
                      <div className={styles.projectImageFallback}>
                        <Building2 size={54} strokeWidth={1} aria-hidden="true" />
                      </div>
                    )}
                    <span className={styles.projectOpen}>
                      <ArrowUpLeft size={22} aria-hidden="true" />
                    </span>
                    {project.location && (
                      <span className={styles.projectLocation}>{project.location}</span>
                    )}
                  </div>
                  <div className={styles.projectCaption}>
                    <div>
                      <span>پروژهٔ فرابک</span>
                      <h3>{project.title}</h3>
                      {index === 0 && project.smallDesc && (
                        <p>{textOnly(project.smallDesc).slice(0, 180)}</p>
                      )}
                    </div>
                    <ArrowUpLeft size={20} aria-hidden="true" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <ProjectsFallback />
        )}
      </div>
    </section>
  );
}

async function HomepageFeed() {
  // Keep an outage-time empty result out of the static shell so the feed retries.
  await io();
  const { projects, publishedProjectCount, blogs, blogFeedStatus } = await getHomepageData();
  return (
    <>
      <ProjectsShowcase projects={projects} publishedProjectCount={publishedProjectCount} />
      <BlogHighlights blogs={blogs} blogFeedStatus={blogFeedStatus} />
    </>
  );
}

function FeedFallback() {
  return (
    <>
      <ProjectsShowcase projects={[]} publishedProjectCount={null} />
      <BlogHighlights blogs={[]} blogFeedStatus="unavailable" />
    </>
  );
}

function CompanyAndSupport() {
  return (
    <section className={styles.companySection} aria-labelledby="company-heading">
      <div className={styles.container}>
        <div className={styles.companyGrid}>
          <div className={styles.companyStory} data-reveal>
            <h2 id="company-heading">فرابک، از {digits(HISTORY_START_YEAR)}</h2>
            <p>
              ثبت فرابک به سال {digits(HISTORY_START_YEAR)} برمی‌گردد. برای شناخت مجموعه‌ای که
              انتخاب می‌کنید، با سابقه، حوزه‌های کاری و اعضای آن آشنا شوید.
            </p>
            <div className={styles.companyLinks}>
              <Link href="/about-us/activity">
                سابقه و فعالیت شرکت
                <ArrowUpLeft size={18} aria-hidden="true" />
              </Link>
              <Link href="/about-us/members">
                آشنایی با اعضای شرکت
                <ArrowUpLeft size={18} aria-hidden="true" />
              </Link>
            </div>
            <div className={styles.historyGraphic} data-reveal aria-hidden="true">
              <span>۱۳۸۱</span>
              <i />
              <span>امروز</span>
            </div>
          </div>
          <div className={styles.supportPanel} data-reveal>
            <div className={styles.supportHeader}>
              <div>
                <p>همراهی، بعد از انتخاب هم ادامه دارد.</p>
                <h3>پشتیبانی در دسترس شما</h3>
              </div>
            </div>
            <Link href="/support/warranty-tracking">
              <span>
                <strong>پیگیری گارانتی</strong>
                <small>بررسی وضعیت گارانتی محصول</small>
              </span>
              <span aria-hidden="true">↖</span>
            </Link>
            <Link href="/support/download-center">
              <span>
                <strong>مرکز دانلود</strong>
                <small>نرم‌افزارها، راهنماها و به‌روزرسانی‌ها</small>
              </span>
              <span aria-hidden="true">↖</span>
            </Link>
            <Link href="/support/faq">
              <span>
                <strong>پاسخ پرسش‌های شما</strong>
                <small>پرسش‌های متداول درباره تجهیزات</small>
              </span>
              <span aria-hidden="true">↖</span>
            </Link>
            <Link href="/contact-us">
              <span>
                <strong>ارتباط با کارشناسان</strong>
                <small>راه‌های تماس و نشانی شرکت</small>
              </span>
              <span aria-hidden="true">↖</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const testimonials = publishedTestimonials(homepageTestimonials);
  if (!testimonials.length) return null;
  return (
    <section className={styles.testimonialsSection} aria-labelledby="testimonials-heading">
      <div className={styles.container}>
        <SectionHeading
          id="testimonials-heading"
          title="اعتماد، از نگاه کسانی که با ما کار کرده‌اند."
        />
        <div className={styles.testimonialGrid}>
          {testimonials.map((item) => (
            <figure key={`${item.name}-${item.source}`} data-reveal>
              <blockquote>{item.quote}</blockquote>
              <figcaption>
                <strong>{item.name}</strong>
                <span>{item.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className={styles.closingSection}>
      <div className={styles.container}>
        <div className={styles.closingPanel}>
          <div className={styles.closingContent}>
            <h2 data-reveal data-reveal-order="0">
              دربارهٔ نیاز پروژه
              <br />
              گفت‌وگو کنیم.
            </h2>
            <p data-reveal data-reveal-order="1">
              اگر مدل را می‌شناسید، تجهیزات را بررسی کنید. اگر نیاز پروژه هنوز روشن نیست، با
              کارشناسان فرابک گفت‌وگو کنید.
            </p>
            <div className={styles.actions} data-reveal data-reveal-order="2">
              <Link className={styles.lightButton} href="/contact-us">
                گفت‌وگو با کارشناسان
                <ArrowUpLeft size={20} aria-hidden="true" />
              </Link>
              <Link className={styles.closingTextLink} href="/products">
                بررسی تجهیزات
                <ArrowLeft size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className={styles.closingMark} data-reveal data-reveal-order="3">
            از شناخت تجهیز
            <span>تا پشتیبانی و پیگیری</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function TrustLanding() {
  return (
    <div className={styles.landing} id="farabak-home">
      <LandingExperience />
      <a href="#product-stories" className={styles.skipLink}>
        رفتن به داستان محصولات
      </a>
      <ProductRangeHero />
      <EvidenceBand />
      <div id="product-stories" className={styles.productStories}>
        {landingStories.map((story, index) => (
          <Fragment key={story.key}>
            <CategoryStory story={story} index={index} />
            {index === 0 && <ProductStoryTransition />}
          </Fragment>
        ))}
      </div>
      <Suspense fallback={<FeedFallback />}>
        <HomepageFeed />
      </Suspense>
      <CompanyAndSupport />
      <Testimonials />
      <Closing />
    </div>
  );
}
