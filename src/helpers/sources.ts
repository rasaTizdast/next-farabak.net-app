export interface SourceLink {
  label: string;
  url: string;
  description?: string;
}

export const BRAND_TOKENS = ["reolink", "smiths", "ceia", "bwdefend"] as const;

export type BrandToken = (typeof BRAND_TOKENS)[number];

export const BRAND_LABELS: Record<BrandToken, string> = {
  reolink: "Reolink",
  smiths: "Smiths Detection",
  ceia: "CEIA",
  bwdefend: "BWDefend",
};

export const BRAND_SOURCES: Record<BrandToken, SourceLink[]> = {
  reolink: [
    {
      label: "وبسایت رسمی Reolink",
      url: "https://reolink.com",
      description: "سایت رسمی برند Reolink؛ دوربین مداربسته و تجهیزات نظارت تصویری",
    },
    {
      label: "مرکز پشتیبانی Reolink",
      url: "https://support.reolink.com",
      description: "مرجع رسمی راهنما، نرم‌افزار و پشتیبانی محصولات Reolink",
    },
  ],
  smiths: [
    {
      label: "وبسایت رسمی Smiths Detection",
      url: "https://www.smithsdetection.com",
      description: "سایت رسمی Smiths Detection؛ تولیدکننده تجهیزات بازرسی امنیتی و آشکارسازها",
    },
  ],
  ceia: [
    {
      label: "وبسایت رسمی CEIA",
      url: "https://www.ceia.net",
      description: "سایت رسمی CEIA؛ تولیدکننده فلزیاب‌های امنیتی و سیستم‌های بازرسی",
    },
  ],
  bwdefend: [],
};

export const FARABAK_SOURCE_PAGES: SourceLink[] = [
  {
    label: "درباره فرابک",
    url: "https://farabak.net/about-us",
    description: "آشنایی با فرابک به عنوان واردکننده تجهیزات امنیتی و نظارت تصویری",
  },
  {
    label: "محصولات فرابک",
    url: "https://farabak.net/products",
    description: "فهرست محصولات امنیتی عرضه شده توسط فرابک",
  },
  {
    label: "پیگیری گارانتی محصولات",
    url: "https://farabak.net/support/warranty-tracking",
    description: "بررسی اصالت و وضعیت گارانتی محصولات خریداری شده",
  },
  {
    label: "مرکز دانلود و نرم‌افزارها",
    url: "https://farabak.net/support/download-center",
    description: "دانلود نرم‌افزار، راهنما و مستندات فنی محصولات",
  },
  {
    label: "سوالات متداول",
    url: "https://farabak.net/support/faq",
    description: "پاسخ به پرتکرارترین سوالات درباره محصولات و خدمات فرابک",
  },
  {
    label: "تماس با فرابک",
    url: "https://farabak.net/contact-us",
    description: "استعلام موجودی، قیمت و مشاوره تخصصی",
  },
];

const FARABAK_PRIORITY_URLS = [
  "https://farabak.net/support/warranty-tracking",
  "https://farabak.net/contact-us",
];

function findBrandTokenAt(text: string, token: string): number {
  const normalized = text.toLowerCase();
  let index = normalized.indexOf(token);
  while (index !== -1) {
    const before = normalized[index - 1];
    const after = normalized[index + token.length];
    const hasBoundaryBefore = before === undefined || !/[a-z0-9]/.test(before);
    const hasBoundaryAfter = after === undefined || !/[a-z0-9]/.test(after);
    if (hasBoundaryBefore && hasBoundaryAfter) {
      return index;
    }
    index = normalized.indexOf(token, index + 1);
  }
  return -1;
}

export function detectBrand(text: string | null | undefined): BrandToken | null {
  if (!text) {
    return null;
  }

  let earliest: { token: BrandToken; index: number } | null = null;
  for (const token of BRAND_TOKENS) {
    const index = findBrandTokenAt(text, token);
    if (index === -1) {
      continue;
    }
    if (earliest === null || index < earliest.index) {
      earliest = { token, index };
    }
  }

  return earliest ? earliest.token : null;
}

function twoMostRelevantFarabakPages(): SourceLink[] {
  const pagesByUrl = new Map(FARABAK_SOURCE_PAGES.map((page) => [page.url, page]));
  const relevant: SourceLink[] = [];
  for (const url of FARABAK_PRIORITY_URLS) {
    const page = pagesByUrl.get(url);
    if (page) {
      relevant.push(page);
    }
  }
  return relevant;
}

export function buildSourcesFor(text: string | undefined | null): SourceLink[] {
  const brandToken = detectBrand(text);
  const officialSources = brandToken ? BRAND_SOURCES[brandToken] : [];
  const farabakSources =
    officialSources.length > 0 ? twoMostRelevantFarabakPages() : FARABAK_SOURCE_PAGES;

  const seenUrls = new Set<string>();
  const sources: SourceLink[] = [];
  for (const source of [...officialSources, ...farabakSources]) {
    if (seenUrls.has(source.url)) {
      continue;
    }
    seenUrls.add(source.url);
    sources.push(source);
  }

  return sources;
}
