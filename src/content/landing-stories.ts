import { landingAssets, type LandingStoryKey } from "@/content/landing-assets";

export type LandingStoryLayout =
  | "screening-threshold"
  | "entrance-frame"
  | "cinema-workspace"
  | "architectural-view"
  | "modular-display";

export type LandingStory = {
  key: LandingStoryKey;
  layout: LandingStoryLayout;
  categoryLabel: string;
  /** A topic label, not a claim that every named manufacturer has a verified Farabak listing. */
  familyLabel: string;
  title: string;
  introduction: string;
  solution: { beforeModel: string; modelName?: string; afterModel?: string };
  factors: readonly [string, string, string];
  selectionPrompt: string;
  categoryHref: string;
  action: { label: string; modelName?: string; href: string };
  mediaLabel: "تصویر مفهومی";
};

/** Editorial selection guidance. These factors are questions, not device specifications. */
export const landingStories = [
  {
    key: "xray",
    layout: "screening-threshold",
    categoryLabel: "بازرسی بار",
    familyLabel: "Smiths Detection X-ray",
    title: "آنچه دیده نمی‌شود، در مسیر بازرسی روشن می‌شود.",
    introduction:
      "در ورودی‌های پرتردد، تصمیم درباره تجهیزات بازرسی از شناخت بار و مسیر حرکت آن شروع می‌شود. محل نصب، حجم عبور و شیوه کار اپراتور را کنار هم ببینید تا مسیر بررسی تجهیزات برای پروژه روشن‌تر شود.",
    solution: {
      beforeModel: "نمونه نام‌دار این خانواده در فهرست فرابک، ",
      modelName: "HI-SCAN 6040 DV",
      afterModel:
        " است. تصویر این بخش فقط فضای کاربرد را به‌صورت مفهومی نشان می‌دهد، نه خود دستگاه یا نتیجه اسکن آن را.",
    },
    factors: ["نوع و اندازه بار", "حجم عبور در هر ورودی", "فضای نصب و مسیر اپراتور"],
    selectionPrompt: "پیش از انتخاب، مسیر ورود بار و شرایط استقرار را مشخص کنید.",
    categoryHref: "/products/x-ray",
    action: { label: "مشاهده", modelName: "HI-SCAN 6040 DV", href: landingAssets.xray.productUrl },
    mediaLabel: "تصویر مفهومی",
  },
  {
    key: "ceia",
    layout: "entrance-frame",
    categoryLabel: "کنترل ورودی",
    familyLabel: "CEIA",
    title: "ورودی پرتردد، تصمیم دقیق.",
    introduction:
      "گیت بازرسی باید با جریان واقعی رفت‌وآمد و فضای ورودی هماهنگ باشد. پیش از گفتگو درباره مدل، نوع تهدید مورد بررسی، تعداد مراجعه‌کنندگان و محدودیت‌های محیطی را روشن کنید تا راهکار متناسب با محل انتخاب شود.",
    solution: {
      beforeModel:
        "این بخش درباره انتخاب راهکار بازرسی نفرات است. مدل مشخصی از این برند در فهرست فعلی فرابک تأیید نشده و تصویر، مطالعه مفهومی فضای ورودی است.",
    },
    factors: ["نوع تهدید مورد بررسی", "جریان تردد", "شرایط محیط و جانمایی"],
    selectionPrompt: "برای تطبیق راهکار با ورودی، شرایط پروژه را شرح دهید.",
    categoryHref: "/contact-us",
    action: { label: "مشاوره برای ورودی", href: landingAssets.ceia.productUrl },
    mediaLabel: "تصویر مفهومی",
  },
  {
    key: "blackmagic",
    layout: "cinema-workspace",
    categoryLabel: "تولید تصویر",
    familyLabel: "Blackmagic",
    title: "تصویر حرفه‌ای از لحظهٔ ثبت آغاز می‌شود.",
    introduction:
      "انتخاب دوربین برای یک پروژه تصویری به خروجی نهایی و روند تولید بستگی دارد. فرمت مورد نیاز، سازگاری تجهیزات و مسیر ضبط تا تدوین را از ابتدا کنار هم بگذارید تا تصمیم تنها بر اساس یک ویژگی گرفته نشود.",
    solution: {
      beforeModel: "نمونه فهرست‌شده‌ای از دوربین‌های این خانواده در فرابک، ",
      modelName: "PYXIS 12K",
      afterModel: " است. فضای استودیویی این بخش مفهومی است و دوربین واقعی را نمایش نمی‌دهد.",
    },
    factors: ["فرمت خروجی", "سازگاری مانت و تجهیزات", "مسیر ضبط و پخش"],
    selectionPrompt: "زنجیره تولید خود را پیش از مقایسه دوربین‌ها مشخص کنید.",
    categoryHref: "/products/blackmagic/professional-camera",
    action: { label: "مشاهده", modelName: "PYXIS 12K", href: landingAssets.blackmagic.productUrl },
    mediaLabel: "تصویر مفهومی",
  },
  {
    key: "cctv",
    layout: "architectural-view",
    categoryLabel: "نظارت تصویری",
    familyLabel: "CCTV / Reolink",
    title: "هر فضا، میدان دید خودش را دارد.",
    introduction:
      "برای طراحی نظارت تصویری، ابتدا نقاطی را که باید دیده شوند و شرایط نور هر بخش را مشخص کنید. سپس درباره جانمایی، مسیر انتقال تصویر و نگهداری داده تصمیم بگیرید تا انتخاب دوربین به نیاز فضا پاسخ دهد.",
    solution: {
      beforeModel: "نمونه فهرست‌شده‌ای از دوربین‌های این خانواده در فرابک، ",
      modelName: "RLC-823A",
      afterModel:
        " است. تصویر معماری این بخش مفهومی است؛ هیچ دوربین یا تصویر زنده‌ای در آن نمایش داده نمی‌شود.",
    },
    factors: ["محدوده پوشش", "شرایط نور شب", "شیوه ذخیره‌سازی"],
    selectionPrompt: "نقشه پوشش و نیاز نگهداری تصویر را پیش از انتخاب تهیه کنید.",
    categoryHref: "/products/reolink-cctv-camera",
    action: { label: "مشاهده", modelName: "RLC-823A", href: landingAssets.cctv.productUrl },
    mediaLabel: "تصویر مفهومی",
  },
  {
    key: "smd-led-wall",
    layout: "modular-display",
    categoryLabel: "نمایش تصویر",
    familyLabel: "SMD LED",
    title: "تصویر بزرگ، با جزئیات نزدیک.",
    introduction:
      "دیوار LED را باید برای محل و مخاطب آن طراحی کرد. فاصله دید، ابعاد سطح نمایش، نور محیط و دسترسی برای سرویس، تصمیم‌های آغازین‌اند؛ با مشخص شدن این‌ها می‌توان درباره راهکار مناسب گفتگو کرد.",
    solution: {
      beforeModel:
        "این بخش یک فضای نمایش ماژولار مفهومی را نشان می‌دهد. محصول یا پروژه مشخصی از فرابک برای این تصویر ادعا نمی‌شود و انتخاب راهکار به بررسی محل نیاز دارد.",
    },
    factors: ["فاصله دید", "ابعاد و نور محیط", "دسترسی برای سرویس"],
    selectionPrompt: "ابعاد فضا و فاصله مخاطب را برای مشاوره آماده کنید.",
    categoryHref: "/contact-us",
    action: { label: "مشاوره دیوار LED", href: landingAssets["smd-led-wall"].productUrl },
    mediaLabel: "تصویر مفهومی",
  },
] as const satisfies readonly LandingStory[];
