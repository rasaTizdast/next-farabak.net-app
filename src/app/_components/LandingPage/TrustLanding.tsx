import { ArrowDownLeft, ArrowLeft, ArrowUpLeft } from "lucide-react";
import { io } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { HISTORY_START_YEAR } from "@/content/homepage-proof";
import { landingAssets } from "@/content/landing-assets";
import { landingStories, type LandingStory } from "@/content/landing-stories";
import { getHomepageData, type HomepageData } from "@/lib/data/homepage";
import { resolveHomepageImage } from "@/lib/homepage-proof";

import LandingExperience from "./LandingExperience";
import RangeInstrument from "./RangeInstrument";

const shell =
  "mx-auto w-full max-w-[1900px] px-6 md:px-12 min-[992px]:px-16 min-[1200px]:px-24 2xl:px-40";
const focus =
  "focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#56bcff]";
const action =
  "group inline-flex min-h-12 items-center justify-center gap-4 bg-[#1265e8] px-5 py-3 text-[15px] font-semibold text-white no-underline transition-[transform,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#0751c1] active:scale-[0.98] " +
  focus;
const textLink =
  "group inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold underline decoration-current/40 underline-offset-6 transition-[color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-[#1265e8] " +
  focus;
const cut =
  "[clip-path:polygon(0_0,calc(100%_-_24px)_0,100%_24px,100%_100%,24px_100%,0_calc(100%_-_24px))]";
const digits = (value: number) =>
  new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(value);

function SectionTitle({
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
  id: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-5 md:mb-12" data-reveal>
      <div>
        <h2
          id={id}
          className="max-w-[17ch] text-[clamp(2.2rem,4.3vw,4.5rem)] leading-tight font-extrabold tracking-tight text-balance"
        >
          {title}
        </h2>
        {description && (
          <p className="mt-4 max-w-[55ch] text-base leading-8 text-[#475c6e]">{description}</p>
        )}
      </div>
      {href && (
        <Link className={textLink} href={href}>
          {linkLabel}
          <ArrowUpLeft size={18} strokeWidth={1.4} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

function Hero() {
  const items = landingStories.map((story) => {
    const media = landingAssets[story.key];
    return {
      key: story.key,
      categoryLabel: story.categoryLabel,
      familyLabel: story.familyLabel,
      title: story.title,
      href: `#story-${story.key}`,
      desktopSrc: media.desktopSrc,
      mobileSrc: media.mobileSrc,
      alt: media.alt,
      mediaStatus: media.mediaStatus,
      caption: media.caption,
    };
  });

  return (
    <section
      className="overflow-hidden bg-[#061a30] py-10 text-white md:pt-16 lg:pt-20"
      aria-labelledby="home-heading"
    >
      <div className={shell}>
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 2xl:gap-20">
          <div className="relative z-1">
            <h1
              id="home-heading"
              className="text-[clamp(2.5rem,6vw,6.1rem)] leading-[1.12] font-black tracking-tight"
            >
              <span className="block overflow-hidden pb-[0.08em]">
                <span className="block whitespace-nowrap" data-reveal data-reveal-order="0">
                  برای هر نگاه،
                </span>
              </span>
              <span className="block overflow-hidden pb-[0.08em]">
                <span className="block whitespace-nowrap" data-reveal data-reveal-order="1">
                  انتخابی دقیق.
                </span>
              </span>
            </h1>
            <p
              className="mt-6 max-w-[42ch] text-lg leading-9 text-[#d0dfeb] md:text-xl md:leading-10"
              data-reveal
              data-reveal-order="2"
            >
              فرابک برای بازرسی، نظارت و تولید تصویر، تجهیزات را از نیاز واقعی فضا و پروژه آغاز
              می‌کند.
            </p>
            <div
              className="mt-7 flex flex-wrap items-center gap-4"
              data-reveal
              data-reveal-order="3"
            >
              <a className={action} href="#range-select">
                حوزه خود را انتخاب کنید
                <ArrowDownLeft size={19} strokeWidth={1.5} aria-hidden="true" />
              </a>
              <Link
                className={
                  "inline-flex min-h-12 items-center gap-2 text-[15px] font-semibold text-white underline decoration-white/50 underline-offset-6 " +
                  focus
                }
                href="/contact-us"
              >
                مشاوره پروژه
                <ArrowLeft size={18} strokeWidth={1.4} aria-hidden="true" />
              </Link>
            </div>
            <p className="mt-10 text-sm leading-7 text-[#b7cbdc]" data-reveal data-reveal-order="4">
              ثبت‌شده از {digits(HISTORY_START_YEAR)} ·{" "}
              <Link
                className={"text-white underline underline-offset-4 " + focus}
                href="/about-us/activity"
              >
                سابقه فرابک
              </Link>
            </p>
          </div>
          <RangeInstrument items={items} />
        </div>
      </div>
    </section>
  );
}

function Evidence() {
  const facts = [
    {
      title: `از ${digits(HISTORY_START_YEAR)}`,
      detail: "سابقه و فعالیت شرکت",
      href: "/about-us/activity",
    },
    { title: "پروژه‌های منتشرشده", detail: "نمونه‌های کار فرابک", href: "/about-us/projects" },
    {
      title: "گارانتی قابل پیگیری",
      detail: "بررسی وضعیت پشتیبانی",
      href: "/support/warranty-tracking",
    },
  ];
  return (
    <nav className="bg-[#e8f0f6] py-8 md:py-11" aria-label="پشتوانه انتخاب فرابک">
      <div className={shell}>
        <div className="grid gap-7 md:grid-cols-3 md:gap-10">
          {facts.map((fact, index) => (
            <Link
              key={fact.href}
              href={fact.href}
              className={
                "group block min-h-16 text-[#09233b] no-underline transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 " +
                focus
              }
              data-reveal
              data-reveal-order={index}
            >
              <strong className="block text-[clamp(1.2rem,1.8vw,1.7rem)] leading-snug font-bold">
                {fact.title}
              </strong>
              <small className="mt-1 block text-sm leading-6 text-[#465d6e]">{fact.detail}</small>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

const chapterSurface = [
  "bg-[#f4f7fa] text-[#09243b]",
  "bg-[#dce8ef] text-[#09243b]",
  "bg-[#122b3d] text-white",
  "bg-white text-[#09243b]",
  "bg-[#1155ae] text-white",
];
const chapterGrid = [
  "lg:grid-cols-[0.8fr_1.2fr]",
  "lg:grid-cols-[1.2fr_0.8fr]",
  "lg:grid-cols-[1fr_1fr]",
  "lg:grid-cols-[1.25fr_0.75fr]",
  "lg:grid-cols-[0.85fr_1.15fr]",
];
const pictureShape = [
  "aspect-[5/4] lg:aspect-[6/5]",
  "aspect-[4/5] lg:aspect-[4/5]",
  "aspect-[5/4] lg:aspect-[4/3]",
  "aspect-[5/4] lg:aspect-[3/2]",
  "aspect-[5/4] lg:aspect-[6/5]",
];

function StoryChapter({ story, index }: { story: LandingStory; index: number }) {
  const media = landingAssets[story.key];
  const dark = index === 2 || index === 4;
  const mediaFirst = index === 1 || index === 3;
  const knowledgeHref =
    story.categoryHref === story.action.href ? "/support/blog" : story.categoryHref;
  return (
    <section
      id={`story-${story.key}`}
      className={`scroll-mt-24 overflow-hidden py-20 md:py-28 xl:py-36 ${chapterSurface[index]}`}
      aria-labelledby={`story-${story.key}-heading`}
    >
      <div className={shell}>
        <div className={`grid items-center gap-10 lg:gap-16 ${chapterGrid[index]}`}>
          <div className={`min-w-0 ${mediaFirst ? "lg:order-2" : ""}`}>
            <h2
              id={`story-${story.key}-heading`}
              className="max-w-[20ch] text-[clamp(2.3rem,4.2vw,4.4rem)] leading-[1.2] font-extrabold tracking-tight text-balance"
              data-reveal
              data-reveal-order="0"
            >
              {story.title}
            </h2>
            <p
              className={`mt-5 text-base leading-8 font-semibold ${dark ? "text-[#b9d8ee]" : "text-[#315e80]"}`}
              data-reveal
              data-reveal-order="1"
            >
              {story.categoryLabel} ·{" "}
              <bdi lang="en" dir="ltr">
                {story.familyLabel}
              </bdi>
            </p>
            <p
              className={`mt-6 max-w-[54ch] text-base leading-8 md:text-lg md:leading-9 ${dark ? "text-[#e0ebf2]" : "text-[#173248]"}`}
              data-reveal
              data-reveal-order="2"
            >
              {story.introduction}
            </p>
            <div className="mt-8" data-reveal data-reveal-order="3">
              <h3 className="text-base font-bold">برای انتخاب، این‌ها مهم‌اند:</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {story.factors.map((factor) => (
                  <li
                    key={factor}
                    className={`px-3 py-2 text-sm leading-6 ${dark ? "bg-white/12 text-white" : "bg-[#d4e4ef] text-[#12374e]"}`}
                  >
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="mt-8 flex flex-wrap items-center gap-5"
              data-reveal
              data-reveal-order="4"
            >
              <Link
                className={`${action} ${index === 4 ? "bg-white text-[#0c3c7d] hover:bg-[#d9ebff]" : ""}`}
                href={story.action.href}
              >
                {story.action.label}
                {story.action.modelName && (
                  <>
                    {" "}
                    <bdi lang="en" dir="ltr">
                      {story.action.modelName}
                    </bdi>
                  </>
                )}
                <ArrowUpLeft size={18} strokeWidth={1.4} aria-hidden="true" />
              </Link>
              <Link
                className={`${textLink} ${dark ? "text-white hover:text-[#c5e7ff]" : ""}`}
                href={knowledgeHref}
              >
                {story.categoryHref === story.action.href
                  ? "راهنماهای انتخاب"
                  : "آشنایی با این حوزه"}
                <ArrowLeft size={17} strokeWidth={1.4} aria-hidden="true" />
              </Link>
            </div>
            <p
              className={`mt-7 max-w-[56ch] text-sm leading-7 ${dark ? "text-[#b8d2e5]" : "text-[#526a7c]"}`}
            >
              {story.solution.beforeModel}
              {story.solution.modelName && (
                <bdi lang="en" dir="ltr">
                  {story.solution.modelName}
                </bdi>
              )}
              {story.solution.afterModel}
            </p>
          </div>
          <figure
            className={`min-w-0 ${mediaFirst ? "lg:order-1" : ""}`}
            data-reveal
            data-reveal-kind="image"
          >
            {media.desktopSrc ? (
              <picture
                className={`block overflow-hidden bg-[#bdd0de] ${cut} ${pictureShape[index]}`}
              >
                {media.mobileSrc && (
                  <source media="(max-width: 767px)" srcSet={media.mobileSrc} type="image/webp" />
                )}
                <Image
                  src={media.desktopSrc}
                  alt={media.alt}
                  width={1536}
                  height={1024}
                  sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1200px) 50vw, 60vw"
                  className="size-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.035]"
                />
              </picture>
            ) : (
              <div
                className={`grid min-h-80 place-items-center bg-[#cadce8] px-7 text-center text-[#254b66] ${cut}`}
              >
                تصویر این حوزه در دست آماده‌سازی است.
              </div>
            )}
            <figcaption
              className={`mt-4 text-sm leading-7 ${dark ? "text-[#c7dbe9]" : "text-[#536a7b]"}`}
            >
              {media.caption}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

function Projects({
  projects,
  publishedProjectCount,
}: Pick<HomepageData, "projects" | "publishedProjectCount">) {
  return (
    <section
      className="scroll-mt-24 bg-[#f4f7fa] py-20 md:py-28 xl:py-36"
      id="published-work"
      aria-labelledby="projects-heading"
    >
      <div className={shell}>
        <SectionTitle
          id="projects-heading"
          title="کار را از نزدیک ببینید"
          description="پروژه‌های منتشرشده، تصویری روشن‌تر از حوزه‌های فعالیت فرابک می‌دهند."
          href="/about-us/projects"
          linkLabel="همه پروژه‌ها"
        />
        {publishedProjectCount !== null && publishedProjectCount > 0 && (
          <p className="mb-6 text-sm text-[#4b6477]">
            {digits(publishedProjectCount)} پروژه در گالری فرابک
          </p>
        )}
        {projects.length ? (
          <div className="grid gap-7 lg:grid-cols-[1.4fr_0.8fr] lg:gap-12">
            {projects.map((project, index) => {
              const image = resolveHomepageImage(project.mainImg, process.env.LIARA_BUCKET_URL);
              return (
                <Link
                  key={project.id}
                  href={`/about-us/projects/${encodeURIComponent(project.slug)}`}
                  className={`group block min-w-0 no-underline ${index === 0 ? "lg:row-span-2" : ""} ${focus}`}
                  data-reveal
                  data-reveal-kind="image"
                >
                  <div
                    className={`relative overflow-hidden bg-[#dce7ef] ${cut} ${index === 0 ? "aspect-5/4 lg:aspect-auto lg:min-h-[620px]" : "aspect-8/5"}`}
                  >
                    {image ? (
                      <Image
                        src={image}
                        alt={project.title}
                        fill
                        sizes={
                          index === 0
                            ? "(max-width: 1024px) 100vw, 58vw"
                            : "(max-width: 1024px) 100vw, 34vw"
                        }
                        className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
                      />
                    ) : (
                      <div className="flex size-full min-h-80 flex-col justify-between bg-[#123c5c] p-7 text-white md:p-10">
                        <span className="text-sm font-semibold">نمونه‌کار منتشرشده</span>
                        <strong className="max-w-[18ch] text-3xl leading-snug font-bold md:text-5xl">
                          {project.title}
                        </strong>
                      </div>
                    )}
                    {project.location && (
                      <span className="absolute right-5 bottom-5 bg-[#061a30] px-3 py-2 text-sm text-white">
                        {project.location}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-4 text-[#09243b]">
                    <h3 className="text-xl leading-8 font-bold md:text-2xl">{project.title}</h3>
                    <ArrowUpLeft
                      size={20}
                      strokeWidth={1.4}
                      className="shrink-0 transition-transform duration-300 group-hover:-translate-1"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div
            className="flex flex-wrap items-center justify-between gap-6 bg-[#dce8ef] p-7 md:p-10"
            data-reveal
          >
            <p className="max-w-[42ch] text-xl leading-9 font-semibold">
              نمونه‌کارهای فرابک را در گالری پروژه‌ها ببینید.
            </p>
            <Link className={textLink} href="/about-us/projects">
              مشاهده پروژه‌ها <ArrowUpLeft size={18} aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function Knowledge({ blogs }: Pick<HomepageData, "blogs">) {
  return (
    <section
      className="scroll-mt-24 bg-white py-20 md:py-28 xl:py-36"
      id="knowledge"
      aria-labelledby="knowledge-heading"
    >
      <div className={shell}>
        <SectionTitle
          id="knowledge-heading"
          title="پیش از انتخاب، بخوانید"
          description="راهنماهای فرابک برای روشن شدن مسئله، قبل از مقایسه مدل‌ها."
          href="/support/blog"
          linkLabel="همه مقاله‌ها"
        />
        {blogs.length ? (
          <div className="grid gap-7 lg:grid-cols-[1.2fr_0.8fr] lg:gap-x-12">
            {blogs.map((article, index) => (
              <Link
                key={article.id}
                href={article.href}
                className={`group block min-w-0 no-underline ${index === 0 ? "lg:row-span-2" : "lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-5"} ${focus}`}
                data-reveal
              >
                {article.image && (
                  <div
                    className={`overflow-hidden bg-[#dce8ef] ${cut} ${index === 0 ? "aspect-8/5" : "aspect-8/5"}`}
                  >
                    <Image
                      src={article.image}
                      alt={article.imageAlt ?? article.title}
                      width={1200}
                      height={675}
                      sizes={
                        index === 0
                          ? "(max-width: 1024px) 100vw, 58vw"
                          : "(max-width: 1024px) 100vw, 25vw"
                      }
                      className="size-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
                    />
                  </div>
                )}
                <div className="py-4 text-[#09243b]">
                  <span className="text-sm text-[#42657d]">{article.category}</span>
                  <h3
                    className={`mt-2 leading-normal font-bold ${index === 0 ? "text-2xl md:text-3xl" : "text-xl"}`}
                  >
                    {article.title}
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-5">
                    خواندن مقاله <ArrowUpLeft size={16} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Link className={textLink} href="/support/blog">
            رفتن به کتابخانه مقاله‌ها <ArrowUpLeft size={18} aria-hidden="true" />
          </Link>
        )}
      </div>
    </section>
  );
}

async function LiveEvidence() {
  await io();
  const { projects, publishedProjectCount, blogs } = await getHomepageData();
  return (
    <>
      <Projects projects={projects} publishedProjectCount={publishedProjectCount} />
      <Knowledge blogs={blogs} />
    </>
  );
}

function Support() {
  const links = [
    ["پیگیری گارانتی", "وضعیت پشتیبانی محصول", "/support/warranty-tracking"],
    ["مرکز دانلود", "راهنماها و نرم‌افزارها", "/support/download-center"],
    ["پرسش‌های متداول", "پاسخ به سؤال‌های رایج", "/support/faq"],
  ] as const;
  return (
    <section
      className="bg-[#09243b] py-20 text-white md:py-28 xl:py-36"
      aria-labelledby="support-heading"
    >
      <div className={shell}>
        <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
          <div data-reveal>
            <h2
              id="support-heading"
              className="max-w-[13ch] text-[clamp(2.3rem,5vw,5.5rem)] leading-[1.2] font-extrabold tracking-tight"
            >
              از {digits(HISTORY_START_YEAR)}، همراه انتخاب شما
            </h2>
            <p className="mt-6 max-w-[52ch] text-base leading-8 text-[#d4e2ec]">
              سابقه، اعضای مجموعه و حوزه‌های فعالیت فرابک را بشناسید؛ بعد از انتخاب هم مسیر پشتیبانی
              روشن است.
            </p>
            <Link
              className={`mt-7 text-white hover:text-[#c6e6fa] ${textLink}`}
              href="/about-us/activity"
            >
              آشنایی با فرابک <ArrowUpLeft size={18} aria-hidden="true" />
            </Link>
          </div>
          <div data-reveal data-reveal-order="1">
            <h3 className="mb-4 text-2xl font-bold">پشتیبانی در دسترس</h3>
            <div className="space-y-2">
              {links.map(([title, detail, href]) => (
                <Link
                  key={href}
                  href={href}
                  className={`group flex min-h-20 items-center justify-between gap-4 bg-white/8 px-5 py-4 text-white no-underline transition-colors duration-300 hover:bg-white/16 ${focus}`}
                >
                  <span>
                    <strong className="block text-base">{title}</strong>
                    <small className="mt-1 block text-sm text-[#bed1df]">{detail}</small>
                  </span>
                  <ArrowUpLeft
                    size={19}
                    strokeWidth={1.4}
                    className="shrink-0 transition-transform duration-300 group-hover:-translate-1"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className="bg-[#f4f7fa] py-20 md:py-28" aria-labelledby="closing-heading">
      <div className={shell}>
        <div className={`bg-[#1265e8] px-7 py-12 text-white md:px-14 md:py-20 xl:px-20 ${cut}`}>
          <h2
            id="closing-heading"
            className="max-w-[15ch] text-[clamp(2.4rem,5.2vw,5.7rem)] leading-[1.2] font-extrabold tracking-tight"
            data-reveal
          >
            از نیاز پروژه بگویید.
          </h2>
          <p
            className="mt-5 max-w-[55ch] text-base leading-8 text-[#e0eeff]"
            data-reveal
            data-reveal-order="1"
          >
            برای انتخاب تجهیزات یا بررسی شرایط محل، مسئله را با کارشناسان فرابک در میان بگذارید.
          </p>
          <div className="mt-8 flex flex-wrap gap-5" data-reveal data-reveal-order="2">
            <Link
              className={`inline-flex min-h-12 items-center gap-3 bg-white px-5 py-3 text-[15px] font-bold text-[#0b438b] no-underline transition-transform duration-300 active:scale-[0.98] ${focus}`}
              href="/contact-us"
            >
              گفت‌وگو با کارشناسان <ArrowUpLeft size={19} strokeWidth={1.4} aria-hidden="true" />
            </Link>
            <Link
              className={`inline-flex min-h-12 items-center gap-2 text-[15px] font-semibold text-white underline underline-offset-6 ${focus}`}
              href="/products"
            >
              بررسی تجهیزات <ArrowLeft size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function TrustLanding() {
  return (
    <div id="farabak-home" dir="rtl" className="overflow-clip bg-[#f4f7fa] text-[#09243b]">
      <LandingExperience />
      <a
        className={`fixed top-24 right-6 z-20 -translate-y-48 bg-[#1265e8] px-4 py-3 text-white focus:translate-y-0 ${focus}`}
        href="#product-stories"
      >
        رفتن به حوزه‌ها
      </a>
      <Hero />
      <Evidence />
      <div id="product-stories">
        {landingStories.map((story, index) => (
          <StoryChapter story={story} index={index} key={story.key} />
        ))}
      </div>
      <Suspense
        fallback={
          <>
            <Projects projects={[]} publishedProjectCount={null} />
            <Knowledge blogs={[]} />
          </>
        }
      >
        <LiveEvidence />
      </Suspense>
      <Support />
      <Closing />
    </div>
  );
}
