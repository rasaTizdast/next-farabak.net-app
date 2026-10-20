import { ArrowUpLeft, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { HomepageBlogItem, HomepageData } from "@/lib/data/homepage";

import styles from "./landing.module.css";

type Props = Pick<HomepageData, "blogs" | "blogFeedStatus">;

const topicLabels: Record<HomepageBlogItem["topic"], string> = {
  xray: "بازرسی بار",
  blackmagic: "تولید تصویر",
  cctv: "نظارت تصویری",
  other: "راهنمای انتخاب",
};

function ArticleCard({ article, lead }: { article: HomepageBlogItem; lead: boolean }) {
  const publishedDate = article.date
    ? new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(article.date))
    : null;

  return (
    <article className={`${styles.blogCard} ${lead ? styles.blogLead : ""}`}>
      <Link href={article.href} className={styles.blogCardLink}>
        <div className={styles.blogMedia}>
          {article.image ? (
            <Image
              src={article.image}
              alt={article.imageAlt ?? article.title}
              width={1200}
              height={675}
              sizes={lead ? "(max-width: 767px) 100vw, 58vw" : "(max-width: 767px) 100vw, 30vw"}
              style={{ width: "100%", height: "auto" }}
            />
          ) : (
            <span className={styles.blogMediaFallback} aria-hidden="true">
              <BookOpen size={34} strokeWidth={1.2} />
            </span>
          )}
        </div>
        <div className={styles.blogCardCopy}>
          <div className={styles.blogCardMeta}>
            <span>{topicLabels[article.topic]}</span>
            {publishedDate && <time dateTime={article.date!}>{publishedDate}</time>}
          </div>
          <h3>{article.title}</h3>
          <p>{article.description || article.reasonToRead}</p>
          <span className={styles.blogReadAction}>
            خواندن مقاله
            <ArrowUpLeft size={17} aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  );
}

export default function BlogHighlights({ blogs, blogFeedStatus }: Props) {
  return (
    <section className={styles.blogSection} id="knowledge" aria-labelledby="knowledge-heading">
      <div className={styles.container}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.sectionEyebrow}>دانش برای انتخاب بهتر</p>
            <h2 id="knowledge-heading">پیش از انتخاب، بیشتر بدانید.</h2>
            <p className={styles.sectionDescription}>
              راهنماها و مقاله‌های منتشرشده فرابک، برای شناخت مسئله و مقایسه گزینه‌ها.
            </p>
          </div>
          <Link className={styles.textLink} href="/support/blog">
            همه مقاله‌ها
            <ArrowUpLeft size={18} aria-hidden="true" />
          </Link>
        </div>
        {blogs.length > 0 ? (
          <div className={styles.blogGrid}>
            {blogs.map((article, index) => (
              <ArticleCard key={article.id} article={article} lead={index === 0} />
            ))}
          </div>
        ) : (
          <p className={styles.blogEmpty}>
            {blogFeedStatus === "unavailable"
              ? "مقاله‌های منتخب اکنون در دسترس نیستند. می‌توانید از کتابخانه مقاله‌ها دیدن کنید."
              : "برای مطالعه راهنماها و مقاله‌های فرابک، به کتابخانه مقاله‌ها بروید."}
          </p>
        )}
      </div>
    </section>
  );
}
