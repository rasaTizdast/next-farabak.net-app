import type { Metadata } from "next";

import { PublicBreadcrumbs } from "@/components/public/PublicBreadcrumbs";

import MeetingRoomPlanner from "./MeetingRoomPlanner";

export const metadata: Metadata = {
  alternates: { canonical: "/support/tools/meeting-room" },
  title: "برنامه‌ریز اولیه نمایشگر اتاق جلسه | فرابک",
  description:
    "اندازهٔ پیشنهادی نمایشگر یا پردهٔ اتاق جلسه را بر اساس فاصلهٔ صندلی‌ها برآورد کنید و برای ویدئوپروژکتور فاصلهٔ تقریبی نصب لنز را ببینید.",
};

export default function MeetingRoomPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-[1580px] px-5 pt-8 min-[992px]:px-16 min-[1200px]:px-24 sm:px-8 md:px-12 2xl:px-40">
        <PublicBreadcrumbs
          breadcrumbs={["/", "/support", "/support/tools", "/support/tools/meeting-room"]}
          labels={{
            "/support/tools": "ابزارهای پشتیبانی",
            "/support/tools/meeting-room": "برنامه‌ریز اتاق جلسه",
          }}
        />
      </div>
      <MeetingRoomPlanner />
    </>
  );
}
