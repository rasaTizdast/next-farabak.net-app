import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpLeft,
  Building2,
  Check,
  CircleHelp,
  Download,
  Fingerprint,
  Headphones,
  House,
  Quote,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { HISTORY_START_YEAR, homepageTestimonials } from "@/content/homepage-proof";
import { getHomepageData } from "@/lib/data/homepage";
import { publishedTestimonials, resolveHomepageImage } from "@/lib/homepage-proof";

import styles from "./landing.module.css";
import LandingExperience from "./LandingExperience";
import SecurityScene from "./SecurityScene";

const digits = (value: number) =>
  new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(value);
const textOnly = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
  id,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  id?: string;
}) {
  return (
    <div className={styles.sectionHeading} data-reveal>
      <div>
        <p className={styles.sectionEyebrow}>{eyebrow}</p>
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

function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="home-heading">
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            <span /> حفاظت الکترونیک، با نگاه یکپارچه
          </p>
          <h1 id="home-heading">
            امنیت،
            <br />
            <span>با پشتوانهٔ فرابک.</span>
          </h1>
          <p className={styles.heroDescription}>
            از انتخاب دوربین برای خانه و کسب‌وکار تا تجهیزات بازرسی و حفاظت سازمانی؛ تخصص، تجهیزات و
            پشتیبانی را کنار هم ببینید.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primaryButton} href="/products">
              مشاهده تجهیزات
              <ArrowUpLeft size={19} aria-hidden="true" />
            </Link>
            <Link className={styles.secondaryButton} href="/contact-us">
              مشاوره برای پروژه
              <ArrowLeft size={18} aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.heroHistory}>
            <span className={styles.historyYear}>از {digits(HISTORY_START_YEAR)}</span>
            <span className={styles.historyDescription}>
              همراه انتخاب‌های امروز
              <br />
              با پشتوانهٔ تجربه
            </span>
            <Link href="/about-us/activity" aria-label="آشنایی با سابقه و فعالیت فرابک">
              <ArrowUpLeft size={22} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className={styles.heroArtwork}>
          <div className={styles.artCaption}>
            <span lang="en" dir="ltr">
              FARABAK / SECURITY SYSTEMS
            </span>
            <span className={styles.artCaptionRule} />
          </div>
          <SecurityScene />
          <div className={styles.artLegend}>
            <span>
              <ScanLine size={16} aria-hidden="true" /> نظارت تصویری
            </span>
            <span>
              <Fingerprint size={16} aria-hidden="true" /> کنترل تردد
            </span>
            <span>
              <ShieldCheck size={16} aria-hidden="true" /> بازرسی امنیتی
            </span>
          </div>
        </div>
      </div>
      <div className={styles.heroBottom}>
        <p>تجهیزات دقیق. انتخاب آگاهانه. همراهی ماندگار.</p>
        <a href="#published-work">
          فرابک را در عمل ببینید
          <ArrowDownLeft size={18} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

function EvidenceBand() {
  return (
    <nav className={styles.evidenceBand} aria-label="پشتوانه انتخاب فرابک">
      <div className={styles.container}>
        <Link href="/about-us/activity">
          <span className={styles.evidenceIcon}>
            <Building2 size={24} aria-hidden="true" />
          </span>
          <span>
            <strong>ریشه‌دار از {digits(HISTORY_START_YEAR)}</strong>
            <small>با سابقه و فعالیت‌های ما آشنا شوید</small>
          </span>
          <ArrowUpLeft size={17} aria-hidden="true" />
        </Link>
        <Link href="/about-us/projects">
          <span className={styles.evidenceIcon}>
            <ScanLine size={25} aria-hidden="true" />
          </span>
          <span>
            <strong>تجربه‌ای که می‌توان دید</strong>
            <small>پروژه‌ها و نمونه‌کارهای فرابک</small>
          </span>
          <ArrowUpLeft size={17} aria-hidden="true" />
        </Link>
        <Link href="/support/warranty-tracking">
          <span className={styles.evidenceIcon}>
            <ShieldCheck size={25} aria-hidden="true" />
          </span>
          <span>
            <strong>پشتیبانی قابل پیگیری</strong>
            <small>دسترسی مستقیم به پیگیری گارانتی</small>
          </span>
          <ArrowUpLeft size={17} aria-hidden="true" />
        </Link>
      </div>
    </nav>
  );
}

function AudiencePaths() {
  return (
    <section
      className={styles.audienceSection}
      id="choose-your-path"
      aria-labelledby="audience-heading"
    >
      <div className={styles.container}>
        <SectionHeading
          id="audience-heading"
          eyebrow="برای هر مقیاس، یک انتخاب دقیق"
          title="از خانهٔ شما تا پروژهٔ سازمان شما."
          description="مسیر مناسب خودتان را انتخاب کنید؛ ما از انتخاب تجهیزات تا پاسخ به پرسش‌های فنی همراهتان هستیم."
        />
        <div className={styles.audienceGrid}>
          <Link href="/products/reolink-cctv-camera" className={styles.audienceCard} data-reveal>
            <div className={styles.audienceCardTop}>
              <House size={29} strokeWidth={1.3} aria-hidden="true" />
              <span>خانه و کسب‌وکار</span>
              <ArrowUpLeft size={22} aria-hidden="true" />
            </div>
            <h3>
              یک نگاه مطمئن،
              <br />
              به آنچه برایتان مهم است.
            </h3>
            <p>
              دوربین‌های نظارتی برای خانه، فروشگاه و محیط کار؛ با امکان بررسی مدل‌ها و دریافت
              راهنمایی برای انتخاب.
            </p>
            <div className={styles.audienceTags}>
              <span>دوربین تحت شبکه</span>
              <span>نظارت تصویری</span>
              <span>Reolink</span>
            </div>
            <span className={styles.audienceAction}>
              انتخاب دوربین
              <ArrowLeft size={18} aria-hidden="true" />
            </span>
            <div className={styles.homeDiagram} aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
          </Link>
          <Link href="/contact-us" className={styles.audienceCard} data-reveal>
            <div className={styles.audienceCardTop}>
              <Building2 size={29} strokeWidth={1.3} aria-hidden="true" />
              <span>سازمان‌ها و پروژه‌ها</span>
              <ArrowUpLeft size={22} aria-hidden="true" />
            </div>
            <h3>
              امنیت یک مجموعه،
              <br />
              با نگاهی به تمام جزئیات.
            </h3>
            <p>
              گفت‌وگو درباره نیاز پروژه در حوزهٔ نظارت تصویری، کنترل تردد و تجهیزات بازرسی امنیتی.
            </p>
            <div className={styles.audienceTags}>
              <span>سیستم‌های حفاظتی</span>
              <span>کنترل تردد</span>
              <span>تجهیزات بازرسی</span>
            </div>
            <span className={styles.audienceAction}>
              گفت‌وگو درباره پروژه
              <ArrowLeft size={18} aria-hidden="true" />
            </span>
            <div className={styles.enterpriseDiagram} aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProjectsFallback() {
  return (
    <div className={styles.projectFallback}>
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

async function HomepageFeed() {
  const { projects, publishedProjectCount, products } = await getHomepageData();
  return (
    <>
      <section
        className={styles.projectsSection}
        id="published-work"
        aria-labelledby="projects-heading"
      >
        <div className={styles.container}>
          <SectionHeading
            id="projects-heading"
            eyebrow="فرابک، در عمل"
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
      <AudiencePaths />
      <section
        className={styles.productsSection}
        id="equipment"
        aria-labelledby="equipment-heading"
      >
        <div className={styles.container}>
          <SectionHeading
            id="equipment-heading"
            eyebrow="تجهیزات، با شناخت بهتر"
            title="انتخاب دقیق، از آشنایی آغاز می‌شود."
            description="محصولات منتخب را بررسی کنید و برای انتخاب متناسب با فضای خود، از کارشناسان راهنمایی بگیرید."
            href="/products"
            linkLabel="مشاهده تمام تجهیزات"
          />
          <div className={styles.brandLine}>
            <span>تجهیزات نظارتی و بازرسی از برندهای تخصصی</span>
            <div dir="ltr" lang="en">
              <b>reolink</b>
              <b>Smiths Detection</b>
              <b>CEIA</b>
            </div>
          </div>
          {products.length ? (
            <div className={styles.productGrid}>
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={product.link}
                  className={styles.productCard}
                  data-reveal
                >
                  <div className={styles.productImage}>
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      sizes="(max-width: 639px) 90vw, (max-width: 1023px) 44vw, 22vw"
                    />
                    <span>
                      <ArrowUpLeft size={19} aria-hidden="true" />
                    </span>
                  </div>
                  <div className={styles.productBody}>
                    <h3 dir="auto">{product.title}</h3>
                    <p>{textOnly(product.desc)}</p>
                    <span>
                      بررسی محصول
                      <ArrowLeft size={16} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.catalogFallback}>
              <ScanLine size={34} strokeWidth={1.2} aria-hidden="true" />
              <p>تجهیزات نظارتی و امنیتی را در کاتالوگ محصولات بررسی کنید.</p>
              <Link className={styles.primaryButton} href="/products">
                ورود به محصولات
                <ArrowUpLeft size={18} aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function FeedFallback() {
  return (
    <>
      <section className={styles.projectsSection} id="published-work">
        <div className={styles.container}>
          <SectionHeading
            eyebrow="فرابک، در عمل"
            title="اعتماد، از کارِ انجام‌شده آغاز می‌شود."
            href="/about-us/projects"
            linkLabel="همهٔ پروژه‌ها"
          />
          <ProjectsFallback />
        </div>
      </section>
      <AudiencePaths />
      <section className={styles.productsSection}>
        <div className={styles.container}>
          <SectionHeading
            eyebrow="تجهیزات، با شناخت بهتر"
            title="انتخاب دقیق، از آشنایی آغاز می‌شود."
            href="/products"
            linkLabel="مشاهده تمام تجهیزات"
          />
          <div className={styles.catalogFallback}>
            <Link className={styles.primaryButton} href="/products">
              ورود به محصولات
              <ArrowUpLeft size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function CompanyAndSupport() {
  return (
    <section className={styles.companySection} aria-labelledby="company-heading">
      <div className={styles.container}>
        <div className={styles.companyGrid}>
          <div className={styles.companyStory} data-reveal>
            <p className={styles.sectionEyebrow}>پشت تجهیزات، آدم‌ها ایستاده‌اند.</p>
            <h2 id="company-heading">
              یک نام،
              <br />
              با سابقه‌ای قابل شناخت.
            </h2>
            <p>
              ثبت فرابک به سال ۱۳۸۱ برمی‌گردد. برای شناخت مجموعه‌ای که انتخاب می‌کنید، با سابقه،
              حوزه‌های کاری و اعضای آن آشنا شوید.
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
            <div className={styles.historyGraphic} aria-hidden="true">
              <span>۱۳۸۱</span>
              <i />
              <span>امروز</span>
            </div>
          </div>
          <div className={styles.supportPanel} data-reveal>
            <div className={styles.supportHeader}>
              <span className={styles.supportIcon}>
                <Headphones size={28} strokeWidth={1.4} aria-hidden="true" />
              </span>
              <div>
                <p>همراهی، بعد از انتخاب هم ادامه دارد.</p>
                <h3>پشتیبانی در دسترس شما</h3>
              </div>
            </div>
            <Link href="/support/warranty-tracking">
              <ShieldCheck size={23} strokeWidth={1.4} aria-hidden="true" />
              <span>
                <strong>پیگیری گارانتی</strong>
                <small>بررسی وضعیت گارانتی محصول</small>
              </span>
              <ArrowUpLeft size={19} aria-hidden="true" />
            </Link>
            <Link href="/support/download-center">
              <Download size={23} strokeWidth={1.4} aria-hidden="true" />
              <span>
                <strong>مرکز دانلود</strong>
                <small>نرم‌افزارها، راهنماها و به‌روزرسانی‌ها</small>
              </span>
              <ArrowUpLeft size={19} aria-hidden="true" />
            </Link>
            <Link href="/support/faq">
              <CircleHelp size={23} strokeWidth={1.4} aria-hidden="true" />
              <span>
                <strong>پاسخ پرسش‌های شما</strong>
                <small>پرسش‌های متداول درباره تجهیزات</small>
              </span>
              <ArrowUpLeft size={19} aria-hidden="true" />
            </Link>
            <Link href="/contact-us">
              <Headphones size={23} strokeWidth={1.4} aria-hidden="true" />
              <span>
                <strong>ارتباط با کارشناسان</strong>
                <small>راه‌های تماس و نشانی شرکت</small>
              </span>
              <ArrowUpLeft size={19} aria-hidden="true" />
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
          eyebrow="روایت همراهان فرابک"
          title="اعتماد، از نگاه کسانی که با ما کار کرده‌اند."
        />
        <div className={styles.testimonialGrid}>
          {testimonials.map((item) => (
            <figure key={`${item.name}-${item.source}`} data-reveal>
              <Quote size={28} aria-hidden="true" />
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
        <div className={styles.closingPanel} data-reveal>
          <div className={styles.closingOrb} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className={styles.closingContent}>
            <p className={styles.eyebrow}>
              <span /> انتخاب مطمئن، با یک گفت‌وگو آغاز می‌شود.
            </p>
            <h2>
              برای امنیت،
              <br />
              با شناخت تصمیم بگیرید.
            </h2>
            <p>
              چه برای یک دوربین، چه برای یک مجموعه؛ نیازتان را با کارشناسان فرابک در میان بگذارید.
            </p>
            <div className={styles.actions}>
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
          <div className={styles.closingMark} lang="en" dir="ltr">
            FARABAK<span>SECURITY. WITH A BACKING.</span>
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
      <a href="#choose-your-path" className={styles.skipLink}>
        رفتن به انتخاب تجهیزات و خدمات
      </a>
      <Hero />
      <EvidenceBand />
      <Suspense fallback={<FeedFallback />}>
        <HomepageFeed />
      </Suspense>
      <CompanyAndSupport />
      <Testimonials />
      <Closing />
      <div className={styles.endNote}>
        <Check size={15} aria-hidden="true" />
        <span>سابقه را بشناسید. نمونه‌کار را ببینید. با اطمینان انتخاب کنید.</span>
      </div>
    </div>
  );
}
