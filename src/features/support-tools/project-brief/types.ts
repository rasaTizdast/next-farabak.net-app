export const projectCategories = [
  { value: "cctv", label: "نظارت تصویری" },
  { value: "xray", label: "بازرسی با ایکس‌ری" },
  { value: "blackmagic", label: "تولید و ضبط ویدئو" },
  { value: "meeting-room", label: "اتاق جلسه و نمایشگر" },
  { value: "other", label: "سایر نیازهای تجهیزاتی" },
] as const;

export type ProjectCategory = (typeof projectCategories)[number]["value"];

export type ProjectBriefInput = {
  contactName: string;
  company: string;
  category: ProjectCategory | "";
  needDescription: string;
  siteSetting: string;
  requirements: string;
  dimensions: string;
  cctvRetention: string;
  xrayObject: string;
  xrayFlow: string;
  blackmagicFormat: string;
  blackmagicWorkflow: string;
  roomDimensions: string;
  viewingDistance: string;
  connectivity: string;
  power: string;
  timeline: string;
  openQuestions: string;
};

export type BriefField = {
  key: Exclude<keyof ProjectBriefInput, "category" | "needDescription">;
  label: string;
  category?: ProjectCategory;
};

export const briefFields: BriefField[] = [
  { key: "contactName", label: "نام مخاطب" },
  { key: "company", label: "نام سازمان یا شرکت" },
  { key: "siteSetting", label: "محل و شرایط اجرا" },
  { key: "requirements", label: "نیازها و اولویت‌ها" },
  { key: "dimensions", label: "ابعاد یا تعداد موردنیاز" },
  { key: "cctvRetention", label: "مدت نگهداری تصاویر مدنظر", category: "cctv" },
  { key: "xrayObject", label: "نوع و ابعاد اشیای قابل بازرسی", category: "xray" },
  { key: "xrayFlow", label: "حجم عبور مورد انتظار", category: "xray" },
  { key: "blackmagicFormat", label: "قالب ضبط مدنظر", category: "blackmagic" },
  { key: "blackmagicWorkflow", label: "شیوه ضبط و پس‌تولید", category: "blackmagic" },
  { key: "roomDimensions", label: "ابعاد اتاق جلسه", category: "meeting-room" },
  { key: "viewingDistance", label: "فاصله معمول بیننده تا نمایشگر", category: "meeting-room" },
  { key: "connectivity", label: "شبکه و درگاه‌های موردنیاز" },
  { key: "power", label: "برق و زیرساخت موجود" },
  { key: "timeline", label: "زمان‌بندی مورد انتظار" },
  { key: "openQuestions", label: "پرسش‌های باز برای بررسی" },
];

export const emptyProjectBrief: ProjectBriefInput = {
  contactName: "",
  company: "",
  category: "",
  needDescription: "",
  siteSetting: "",
  requirements: "",
  dimensions: "",
  cctvRetention: "",
  xrayObject: "",
  xrayFlow: "",
  blackmagicFormat: "",
  blackmagicWorkflow: "",
  roomDimensions: "",
  viewingDistance: "",
  connectivity: "",
  power: "",
  timeline: "",
  openQuestions: "",
};

export function validateProjectBrief(input: ProjectBriefInput) {
  return {
    category: Boolean(input.category),
    needDescription: input.needDescription.trim().length >= 12,
  };
}
