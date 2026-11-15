"use client";

import { ArrowLeft, ArrowUpLeft, Phone } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";

import Link from "@/components/NoPrefetchLink";
import { PublicShell } from "@/components/public/PublicShell";
import { landingAssets } from "@/content/landing-assets";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a9dcff]";

export default function EditorialHero() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const animations = Array.from(hero.querySelectorAll<HTMLElement>("[data-hero-reveal]")).map(
      (element, index) =>
        element.animate(
          [
            { opacity: 0.5, transform: "translateY(18px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 650, delay: index * 90, easing: "cubic-bezier(.22,1,.36,1)" }
        )
    );
    return () => animations.forEach((animation) => animation.cancel());
  }, []);

  return (
    <section
      ref={heroRef}
      aria-labelledby="home-heading"
      className="relative isolate max-h-svh overflow-hidden bg-[#061a30] text-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_90%_at_78%_47%,#174777_0%,#0a294b_45%,#061a30_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0px,transparent_79px,rgba(144,204,238,.1)_80px)] mask-[linear-gradient(90deg,transparent,black_48%)] opacity-35"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-[65%] size-[min(76vw,920px)] -translate-1/2 rounded-full border border-[#8dd7ff]/15 shadow-[0_0_0_80px_rgba(135,211,255,.035),0_0_0_180px_rgba(135,211,255,.025)]"
      />
      <PublicShell className="relative py-5 max-md:px-5 md:py-8 lg:py-10">
        <div className="grid items-center gap-5 md:grid-cols-[0.94fr_1.06fr] md:gap-8 lg:gap-14 xl:gap-20">
          <div className="min-w-0">
            <div
              data-hero-reveal
              className="mb-3 flex items-center gap-2 text-[11px] font-semibold text-[#9fc7df] md:mb-6 md:gap-3 md:text-xs"
            >
              <span className="h-px w-5 bg-[#66bce7] md:w-9" aria-hidden="true" />
              <span>فرابک / تجهیزات و راهکارهای تخصصی</span>
            </div>
            <h1
              id="home-heading"
              data-hero-reveal
              className="max-w-[15ch] text-[clamp(2rem,8.5vw,2.8rem)] leading-[1.21] font-black tracking-[-0.045em] text-balance md:max-w-[12ch] md:text-[clamp(2rem,5vw,5.8rem)] md:leading-[1.14]"
            >
              برای پروژه‌تان، <span className="text-[#8fd6ff]">تجهیزات درست</span> پیدا کنید.
            </h1>
            <p
              data-hero-reveal
              className="mt-3 max-w-[44ch] text-[13px] leading-6 text-[#d4e3ef] md:mt-6 md:text-base md:leading-8 lg:text-lg"
            >
              نوع فضا و نیازتان را با ما در میان بگذارید تا مسیر انتخاب تجهیزات بازرسی، نظارت یا
              تولید تصویر روشن‌تر شود.
            </p>
            <div
              data-hero-reveal
              className="mt-5 flex flex-col items-stretch gap-1 md:mt-7 md:flex-row md:flex-wrap md:items-center md:gap-5"
            >
              <a
                href="tel:02177500008"
                className={`group inline-flex min-h-12 items-center justify-center gap-4 bg-[#1265e8] px-5 py-3 text-sm font-bold text-white transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-[#267bfa] motion-reduce:transform-none md:min-h-14 md:justify-between md:gap-8 md:px-6 md:py-3.5 md:text-base ${focus}`}
              >
                تماس با بخش فروش <Phone size={20} aria-hidden="true" />
              </a>
              <Link
                href="/products"
                className={`inline-flex min-h-10 items-center justify-center gap-2 text-sm font-semibold text-white underline decoration-[#8fd6ff] underline-offset-6 hover:text-[#b6e5ff] md:min-h-12 md:justify-start md:text-base ${focus}`}
              >
                بررسی تجهیزات <ArrowLeft size={19} aria-hidden="true" />
              </Link>
            </div>
            <div
              data-hero-reveal
              className="mt-8 hidden max-w-[500px] grid-cols-2 border-t border-white/20 pt-4 text-sm leading-6 text-[#b3cedf] md:grid"
            >
              <span>ثبت شرکت از ۱۳۸۱</span>
              <span className="border-r border-white/20 pr-5">از انتخاب تا پشتیبانی</span>
            </div>
          </div>
          <div data-hero-reveal className="relative min-w-0 pb-0 md:pb-8 lg:pb-10" dir="ltr">
            <div
              className="absolute -top-5 -right-5 z-10 hidden size-24 border-t border-r border-[#8fd6ff]/65 md:block"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-1 -left-5 z-10 hidden size-24 border-b border-l border-[#8fd6ff]/65 md:block"
              aria-hidden="true"
            />
            <figure className="relative overflow-hidden border border-[#b7e5ff]/30 bg-[#142f45] shadow-[0_40px_100px_rgba(0,0,0,.42)] [clip-path:polygon(0_0,calc(100%-18px)_0,100%_18px,100%_100%,18px_100%,0_calc(100%-18px))] md:ml-[8%] md:[clip-path:polygon(0_0,calc(100%-28px)_0,100%_28px,100%_100%,28px_100%,0_calc(100%-28px))]">
              <Image
                src={landingAssets.xray.desktopSrc}
                alt={landingAssets.xray.alt}
                width={1536}
                height={1024}
                sizes="(max-width: 1023px) 88vw, 48vw"
                priority
                className="h-[clamp(145px,24svh,210px)] w-full object-cover object-[center_56%] transition-transform duration-1000 ease-[cubic-bezier(.22,1,.36,1)] hover:scale-[1.04] motion-reduce:transform-none md:h-[min(58svh,520px)] lg:h-[min(68svh,680px)]"
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_48%,rgba(3,19,34,.88)_100%)]" />
              <figcaption
                className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-4 text-white md:inset-x-8 md:bottom-7"
                dir="rtl"
              >
                <span className="text-xs font-bold md:text-base">
                  بازرسی بار / ورودی‌های پرتردد
                </span>
              </figcaption>
            </figure>
            <figure className="absolute -bottom-1 left-0 hidden w-[42%] border-[5px] border-[#061a30] bg-[#173750] shadow-[0_20px_55px_rgba(0,0,0,.4)] md:bottom-0 md:block md:w-[39%] md:border-8">
              <Image
                src={landingAssets.blackmagic.desktopSrc}
                alt={landingAssets.blackmagic.alt}
                width={1536}
                height={1024}
                sizes="(max-width: 1023px) 40vw, 20vw"
                className="aspect-4/5 w-full object-cover"
              />
              <figcaption
                className="absolute inset-x-0 bottom-0 bg-[#061a30]/85 p-2 text-center text-[11px] font-semibold text-white md:p-3 md:text-sm"
                dir="rtl"
              >
                تولید تصویر
              </figcaption>
            </figure>
            <div
              className="absolute top-4 left-0 hidden -translate-x-1/2 border border-[#9bdcff]/40 bg-[#09243b]/90 px-4 py-3 text-xs tracking-[0.17em] text-[#c5e9ff] uppercase backdrop-blur-sm md:block"
              aria-hidden="true"
            >
              Farabak / Focus
            </div>
          </div>
        </div>
      </PublicShell>
    </section>
  );
}
