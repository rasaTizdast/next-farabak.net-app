import type { Metadata } from "next";

import { PublicBreadcrumbs } from "@/components/public/PublicBreadcrumbs";
import { PublicShell } from "@/components/public/PublicShell";

import ProjectBriefBuilder from "./ProjectBriefBuilder";
import "./print.css";

export const metadata: Metadata = {
  alternates: { canonical: "/support/tools/project-brief" },
  title: "ساخت شرح پروژه تجهیزات | فرابک",
  description:
    "نیازهای پروژه نظارتی، بازرسی، تولید ویدئو یا اتاق جلسه را در یک شرح اولیه و قابل چاپ جمع‌آوری کنید.",
};

export default function ProjectBriefPage() {
  return (
    <PublicShell className="pt-6 pb-12 sm:pt-8 sm:pb-16">
      <PublicBreadcrumbs
        breadcrumbs={["/", "/support", "/support/tools", "/support/tools/project-brief"]}
        labels={{
          "/support/tools": "ابزارهای آنلاین",
          "/support/tools/project-brief": "شرح پروژه",
        }}
      />
      <header className="max-w-4xl py-6 sm:py-9">
        <p className="text-sm font-semibold text-(--farabak-action-blue)">شرح نیاز پروژه</p>
        <h1 className="mt-3 text-3xl leading-[1.4] font-bold tracking-tight text-(--farabak-ink-deep) sm:text-4xl md:text-5xl">
          پیش از انتخاب مدل، نیاز را دقیق‌تر بنویسید
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-(--farabak-ink-muted) sm:text-lg">
          فقط دسته پروژه و شرح کوتاهی از نیازتان لازم است؛ جزئیات دیگر اختیاری‌اند. پاسخ‌ها در همین
          صفحه می‌مانند و برای فرابک ارسال یا ذخیره نمی‌شوند.
        </p>
      </header>
      <ProjectBriefBuilder />
    </PublicShell>
  );
}
