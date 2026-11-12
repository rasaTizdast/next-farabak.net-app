"use client";

import { ArrowDownLeft, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";

import Link from "@/components/NoPrefetchLink";
import { PublicShell } from "@/components/public/PublicShell";
import { landingAssets } from "@/content/landing-assets";

export default function EditorialHero() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = root.current;
    if (!section || typeof matchMedia !== "function" || typeof section.animate !== "function")
      return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    let animations: Animation[] = [];
    let frame = 0;
    const pictures = section.querySelectorAll<HTMLElement>("[data-hero-picture]");
    const reset = () => {
      animations.forEach((a) => a.cancel());
      animations = [];
      pictures.forEach((p) => p.style.removeProperty("transform"));
    };
    const scroll = () => {
      if (preference.matches || connection?.saveData || document.hidden) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const progress = Math.max(
          0,
          Math.min(1, -section.getBoundingClientRect().top / section.offsetHeight)
        );
        pictures.forEach((p, i) => {
          p.style.transform = `translateY(${progress * (i ? -24 : 28)}px)`;
        });
      });
    };
    const start = () => {
      reset();
      if (preference.matches || connection?.saveData) return;
      section.querySelectorAll<HTMLElement>("[data-hero-enter]").forEach((element, i) => {
        animations.push(
          element.animate(
            [
              { transform: `translateY(${i < 2 ? 38 : 22}px)`, opacity: 0.35 },
              { transform: "translateY(0)", opacity: 1 },
            ],
            { duration: 850, delay: i * 75, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" }
          )
        );
      });
    };
    start();
    preference.addEventListener("change", start);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      reset();
      cancelAnimationFrame(frame);
      preference.removeEventListener("change", start);
      window.removeEventListener("scroll", scroll);
    };
  }, []);
  return (
    <section
      ref={root}
      aria-labelledby="home-heading"
      className="overflow-hidden bg-[#061a30] pt-9 pb-10 text-white md:pt-14 md:pb-16"
    >
      <PublicShell>
        <div className="grid items-end gap-6 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
          <h1
            id="home-heading"
            className="text-[clamp(2.35rem,5.7vw,5.6rem)] leading-[1.2] font-black tracking-tight"
          >
            <span className="block" data-hero-enter>
              برای هر نگاه،
            </span>
            <span className="block" data-hero-enter>
              انتخابی دقیق.
            </span>
          </h1>
          <div className="pb-2">
            <p data-hero-enter className="max-w-[38ch] text-base leading-8 md:text-lg md:leading-9">
              تجهیزات بازرسی، نظارت و تولید تصویر؛ از شناخت نیاز پروژه تا انتخاب تخصصی، همراه شما
              هستیم.
            </p>
            <div data-hero-enter className="mt-5 flex flex-wrap items-center gap-5">
              <Link
                href="/products"
                className="group inline-flex min-h-12 items-center gap-5 bg-[#1265e8] px-5 py-3 text-base font-bold text-white transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:scale-95 motion-reduce:transform-none"
              >
                بررسی تجهیزات <ArrowLeft size={20} aria-hidden="true" />
              </Link>
              <Link
                href="/contact-us"
                className="inline-flex min-h-12 items-center gap-2 text-base text-white underline underline-offset-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                مشاوره پروژه <ArrowDownLeft size={19} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-[1fr_2fr] items-end gap-3 md:mt-12 md:gap-6" dir="ltr">
          <figure data-hero-enter className="min-w-0">
            <div className="overflow-hidden bg-[#163247]" data-hero-picture>
              <Image
                src={landingAssets.xray.desktopSrc}
                alt={landingAssets.xray.alt}
                width={1536}
                height={1024}
                sizes="(max-width: 767px) 30vw, 28vw"
                className="aspect-4/5 size-full object-cover md:aspect-square"
              />
            </div>
            <figcaption className="mt-3 text-right text-sm leading-6 md:text-base" dir="rtl">
              بازرسی و امنیت
            </figcaption>
          </figure>
          <figure data-hero-enter className="min-w-0">
            <div className="overflow-hidden bg-[#163247]" data-hero-picture>
              <Image
                src={landingAssets.blackmagic.desktopSrc}
                alt={landingAssets.blackmagic.alt}
                width={1536}
                height={1024}
                sizes="(max-width: 767px) 62vw, 58vw"
                loading="eager"
                fetchPriority="high"
                className="aspect-4/3 size-full object-cover md:aspect-video"
              />
            </div>
            <figcaption
              className="mt-3 flex flex-wrap justify-between gap-1 text-sm leading-6 md:text-base"
              dir="rtl"
            >
              <span>تولید و نمایش تصویر</span>
              <span className="text-sm">تصویرسازی با هوش مصنوعی</span>
            </figcaption>
          </figure>
        </div>
        <div
          data-hero-enter
          className="mt-7 flex flex-wrap items-center justify-between gap-4 text-sm md:text-base"
        >
          <p>فرابک، ثبت‌شده از ۱۳۸۱</p>
          <a
            href="#product-stories"
            className="inline-flex min-h-11 items-center gap-3 text-white underline underline-offset-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            راهکار متناسب با پروژه شما <ArrowDownLeft size={20} aria-hidden="true" />
          </a>
        </div>
      </PublicShell>
    </section>
  );
}
