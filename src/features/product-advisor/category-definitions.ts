import type { AdvisorCategoryDefinition, AdvisorQuestion, AdvisorQuestionOption } from "./types";

const unknownOption: AdvisorQuestionOption = {
  id: "unknown",
  label: "نمی‌دانم",
  helper: "این مورد را در نتیجه به‌عنوان نیاز بررسی‌نشده نشان می‌دهیم.",
};

function question(
  id: string,
  label: string,
  options: readonly AdvisorQuestionOption[],
  help?: string
): AdvisorQuestion {
  return { id, label, help, type: "single", options: [...options, unknownOption] };
}

const commonNormalizers = [
  { key: "placement", label: "محل نصب", sourceLabels: ["محل نصب", "کاربری", "محیط"] },
  { key: "night-detail", label: "جزئیات شب", sourceLabels: ["دید در شب", "Night Vision"] },
  { key: "resolution", label: "رزولوشن", sourceLabels: ["رزولوشن", "Resolution"] },
  { key: "connection", label: "اتصال", sourceLabels: ["اتصال", "Interface", "I/O"] },
] as const;

const reolink: AdvisorCategoryDefinition = {
  slug: "reolink-cctv-camera",
  label: "دوربین مداربسته رئولینک",
  intentIds: ["protect-building"],
  normalizers: commonNormalizers,
  questions: [
    question("placement", "دوربین کجا نصب می‌شود؟", [
      { id: "indoor", label: "فضای داخلی" },
      { id: "outdoor", label: "فضای باز" },
    ]),
    question("coverage-goal", "چه چیزی را می‌خواهید پوشش دهید؟", [
      { id: "entry", label: "ورودی یا خروجی" },
      { id: "area", label: "یک محوطه" },
      { id: "point", label: "یک نقطه مشخص" },
    ]),
    question("night-detail", "جزئیات تصویر شب چقدر مهم است؟", [
      { id: "high", label: "خیلی مهم" },
      { id: "standard", label: "استاندارد کافی است" },
    ]),
    question("connection", "برای برق و اتصال چه محدودیتی دارید؟", [
      { id: "wired", label: "اتصال سیمی" },
      { id: "wireless", label: "اتصال بی‌سیم" },
      { id: "poe", label: "ترجیحاً PoE" },
    ]),
  ],
  rules: [
    {
      questionId: "placement",
      optionId: "outdoor",
      specKey: "placement",
      acceptedValues: ["outdoor", "خارجی", "فضای باز"],
      evidenceLabel: "برای فضای باز ثبت شده است",
    },
    {
      questionId: "placement",
      optionId: "indoor",
      specKey: "placement",
      acceptedValues: ["indoor", "داخلی", "فضای داخلی"],
      evidenceLabel: "برای فضای داخلی ثبت شده است",
    },
    {
      questionId: "night-detail",
      optionId: "high",
      specKey: "night-detail",
      acceptedValues: ["high", "بالا", "رنگی", "color"],
      evidenceLabel: "جزئیات شبِ بالا ثبت شده است",
    },
  ],
};

function category(
  slug: string,
  label: string,
  intentIds: readonly string[],
  prompts: readonly [string, string, readonly AdvisorQuestionOption[]][],
  rules: AdvisorCategoryDefinition["rules"] = []
): AdvisorCategoryDefinition {
  return {
    slug,
    label,
    intentIds,
    normalizers: commonNormalizers,
    questions: prompts.map(([id, prompt, options]) => question(id, prompt, options)),
    rules,
  };
}

function catalogRule(
  questionId: string,
  optionId: string,
  productKeywords: readonly string[],
  evidenceLabel: string
) {
  return { questionId, optionId, productKeywords, evidenceLabel };
}

export const advisorCategoryDefinitions: Record<string, AdvisorCategoryDefinition> = {
  [reolink.slug]: reolink,
  "industrial-cctv-camera": category(
    "industrial-cctv-camera",
    "دوربین صنعتی و ضد انفجار",
    ["monitor-industrial"],
    [
      [
        "environment",
        "محیط استفاده چگونه است؟",
        [
          { id: "industrial", label: "صنعتی" },
          { id: "hazardous", label: "حساس یا پرخطر" },
        ],
      ],
      [
        "scene",
        "چه صحنه‌ای را پایش می‌کنید؟",
        [
          { id: "area", label: "محوطه" },
          { id: "point", label: "نقطه مشخص" },
        ],
      ],
      [
        "detail",
        "چه سطحی از جزئیات تصویر می‌خواهید؟",
        [
          { id: "standard", label: "استاندارد" },
          { id: "high", label: "بالا" },
        ],
      ],
    ],
    [
      catalogRule("environment", "hazardous", ["ضد انفجار", "atex", "zone", "explosion"], "برای محیط پرخطر ثبت شده است"),
      catalogRule("environment", "industrial", ["حرارتی", "thermal", "دوربین", "camera"], "برای پایش صنعتی ثبت شده است"),
      catalogRule("scene", "area", ["ptz", "حرارتی", "thermal", "x36c"], "برای پوشش محوطه ثبت شده است"),
      catalogRule("scene", "point", ["ماژول", "module", "x36c", "sgc-ex-sh"], "برای پایش نقطه‌ای ثبت شده است"),
      catalogRule("detail", "high", ["زوم", "zoom", "حرارتی", "thermal", "x36c"], "جزئیات یا زوم پیشرفته در نام محصول ثبت شده است"),
    ]
  ),
  blackmagic: category(
    "blackmagic",
    "محصولات بلک‌مجیک",
    ["produce-video"],
    [
      [
        "workflow",
        "کار اصلی شما چیست؟",
        [
          { id: "capture", label: "تصویربرداری" },
          { id: "live", label: "تولید زنده" },
          { id: "post", label: "پس‌تولید" },
        ],
      ],
      [
        "resolution",
        "هدف رزولوشن شما چیست؟",
        [
          { id: "hd", label: "HD" },
          { id: "4k", label: "4K" },
          { id: "high", label: "بالاتر از 4K" },
        ],
      ],
      [
        "form-factor",
        "چه فرم‌فکتوری ترجیح می‌دهید؟",
        [
          { id: "compact", label: "جمع‌وجور" },
          { id: "studio", label: "استودیویی" },
        ],
      ],
    ],
    [
      catalogRule("workflow", "capture", ["camera", "ursa", "pyxis", "pocket"], "برای تصویربرداری ثبت شده است"),
      catalogRule("workflow", "live", ["atem", "web presenter", "streaming", "ultimatte", "studio camera"], "برای تولید زنده ثبت شده است"),
      catalogRule("workflow", "post", ["davinci", "decklink", "ultrastudio", "cintel"], "برای پس‌تولید ثبت شده است"),
      catalogRule("resolution", "4k", ["4k", "12g", "ultra hd"], "پشتیبانی 4K یا Ultra HD در نام محصول ثبت شده است"),
      catalogRule("resolution", "high", ["8k", "12k", "17k"], "رزولوشن بالاتر از 4K در نام محصول ثبت شده است"),
      catalogRule("form-factor", "compact", ["micro", "mini", "pocket"], "فرم جمع‌وجور در نام محصول ثبت شده است"),
      catalogRule("form-factor", "studio", ["studio", "ursa", "atem"], "برای استودیو ثبت شده است"),
    ]
  ),
  "x-ray": category(
    "x-ray",
    "دستگاه ایکس‌ری",
    ["inspect-items"],
    [
      [
        "object-size",
        "چه چیزی را بررسی می‌کنید؟",
        [
          { id: "bag", label: "کیف و چمدان" },
          { id: "parcel", label: "بسته و مرسوله" },
          { id: "large", label: "اقلام بزرگ‌تر" },
        ],
      ],
      [
        "traffic",
        "حجم عبور چقدر است؟",
        [
          { id: "standard", label: "استاندارد" },
          { id: "high", label: "بالا" },
        ],
      ],
      [
        "space",
        "فضای نصب چه وضعیتی دارد؟",
        [
          { id: "limited", label: "محدود" },
          { id: "open", label: "فضای کافی" },
        ],
      ],
    ],
    [
      catalogRule("object-size", "bag", ["چمدان", "6040", "fxr-1d"], "برای بازرسی کیف یا چمدان ثبت شده است"),
      catalogRule("object-size", "parcel", ["fxr-2d", "6550", "6040"], "برای مرسوله ثبت شده است"),
      catalogRule("object-size", "large", ["6550", "200 کیلو"], "برای اقلام بزرگ‌تر ثبت شده است"),
      catalogRule("traffic", "high", ["6040", "6550", "dv"], "برای حجم عبور بالاتر ثبت شده است"),
      catalogRule("traffic", "standard", ["fxr-1d", "fxr-2d"], "برای حجم عبور استاندارد ثبت شده است"),
      catalogRule("space", "limited", ["fxr-1d", "6040"], "برای فضای نصب محدود ثبت شده است"),
    ]
  ),
  "ai-supercomputers-hpc": category(
    "ai-supercomputers-hpc",
    "ابررایانه هوش مصنوعی",
    ["choose-hpc"],
    [
      [
        "workload",
        "بار کاری اصلی چیست؟",
        [
          { id: "inference", label: "استنتاج" },
          { id: "training", label: "آموزش مدل" },
          { id: "research", label: "پژوهش" },
        ],
      ],
      [
        "priority",
        "اولویت شما چیست؟",
        [
          { id: "compute", label: "توان پردازش" },
          { id: "memory", label: "حافظه" },
        ],
      ],
      [
        "scale",
        "مقیاس مورد انتظار چیست؟",
        [
          { id: "single", label: "یک سیستم" },
          { id: "expandable", label: "قابل توسعه" },
        ],
      ],
    ],
    [
      catalogRule("workload", "inference", ["dgx h100", "dgx h200"], "برای بار کاری هوش مصنوعی ثبت شده است"),
      catalogRule("workload", "training", ["dgx h100", "dgx h200"], "برای آموزش مدل ثبت شده است"),
      catalogRule("workload", "research", ["dgx h100", "dgx h200"], "برای پژوهش ثبت شده است"),
      catalogRule("priority", "compute", ["dgx h100"], "گزینه DGX H100 برای توان پردازش انتخاب شده است"),
      catalogRule("priority", "memory", ["dgx h200"], "گزینه DGX H200 برای نیاز حافظه انتخاب شده است"),
      catalogRule("scale", "single", ["dgx h100", "dgx h200"], "برای استقرار تک‌سیستم ثبت شده است"),
    ]
  ),
  "conference-hall": category(
    "conference-hall",
    "سالن کنفرانس و همایش",
    ["equip-room"],
    [
      [
        "room-scale",
        "فضای شما چه اندازه‌ای دارد؟",
        [
          { id: "small", label: "کوچک" },
          { id: "medium", label: "متوسط" },
          { id: "large", label: "بزرگ" },
        ],
      ],
      [
        "meeting-format",
        "نوع جلسه چیست؟",
        [
          { id: "hybrid", label: "حضوری و آنلاین" },
          { id: "in-person", label: "حضوری" },
        ],
      ],
      [
        "sharing",
        "اشتراک‌گذاری محتوا چقدر مهم است؟",
        [
          { id: "essential", label: "ضروری" },
          { id: "basic", label: "محدود" },
        ],
      ],
    ]
  ),
  "imaging-cameras-equipment": category(
    "imaging-cameras-equipment",
    "دوربین و تجهیزات تصویربرداری",
    ["capture-image"],
    [
      [
        "application",
        "کاربرد اصلی چیست؟",
        [
          { id: "inspection", label: "بازرسی" },
          { id: "documentation", label: "مستندسازی" },
        ],
      ],
      [
        "environment",
        "محیط استفاده چگونه است؟",
        [
          { id: "indoor", label: "داخلی" },
          { id: "outdoor", label: "باز" },
        ],
      ],
    ],
    [
      catalogRule("application", "inspection", ["ماژول", "module"], "برای کاربرد بازرسی ثبت شده است"),
      catalogRule("application", "documentation", ["hd-sdi", "فول اچ‌دی"], "برای مستندسازی تصویری ثبت شده است"),
    ]
  ),
  others: category(
    "others",
    "دیگر محصولات",
    ["other"],
    [
      [
        "application",
        "بیشتر دنبال چه نوع محصولی هستید؟",
        [
          { id: "camera-power", label: "برق یا لوازم دوربین" },
          { id: "inspection", label: "بازرسی صنعتی یا امنیتی" },
          { id: "storage", label: "ذخیره‌سازی NAS یا سرور" },
        ],
      ],
      [
        "constraint",
        "مهم‌ترین محدودیت شما چیست؟",
        [
          { id: "space", label: "فضا" },
          { id: "connection", label: "اتصال" },
          { id: "budget", label: "بودجه" },
        ],
      ],
    ],
    [
      catalogRule("application", "camera-power", ["solar", "power supply", "رئولینک"], "برای برق یا لوازم دوربین ثبت شده است"),
      catalogRule("application", "inspection", ["xrf", "orion"], "برای بازرسی صنعتی یا امنیتی ثبت شده است"),
      catalogRule("application", "storage", ["ironwolf", "nas"], "برای ذخیره‌سازی NAS یا سرور ثبت شده است"),
    ]
  ),
};

export const advisorIntentOptions = [
  { id: "protect-building", label: "پایش ساختمان یا ورودی", categorySlug: "reolink-cctv-camera" },
  { id: "monitor-industrial", label: "پایش محیط صنعتی", categorySlug: "industrial-cctv-camera" },
  { id: "produce-video", label: "تولید حرفه‌ای ویدئو", categorySlug: "blackmagic" },
  { id: "inspect-items", label: "بازرسی کیف یا مرسوله", categorySlug: "x-ray" },
  { id: "choose-hpc", label: "زیرساخت هوش مصنوعی", categorySlug: "ai-supercomputers-hpc" },
] as const;
