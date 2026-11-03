import type { Metadata } from "next";

import MeetingRoomPlanner from "./MeetingRoomPlanner";

export const metadata: Metadata = {
  title: "برنامه‌ریز اولیه نمایشگر اتاق جلسه | فرابک",
  description: "برآورد اولیه اندازه نمایشگر اتاق جلسه بر پایه فاصله دید، همراه با نکات لازم برای بررسی فنی.",
  alternates: { canonical: "/support/tools/meeting-room" },
};

export default function MeetingRoomPage() {
  return <MeetingRoomPlanner />;
}
