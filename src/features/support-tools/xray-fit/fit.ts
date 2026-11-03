import type { FitResult, ScannerFitFacts, SiteFitInput } from "./types";

export function assessScannerFit(input: SiteFitInput, facts: ScannerFitFacts): FitResult {
  const passed: string[] = [];
  const failed: string[] = [];
  const missing: string[] = [];

  const objectComparisons = [
    ["عرض شیء و دهانه", input.objectWidthMm, facts.tunnelWidthMm],
  ] as const;

  for (const [label, object, opening] of objectComparisons) {
    if (object === null) missing.push(`اندازه ${label} وارد نشده است`);
    if (opening === null) missing.push(`مشخصات ${label} در منبع موجود نیست`);
    if (object !== null && opening !== null) {
      if (input.clearanceMm === null) {
        missing.push("فاصله آزاد موردنیاز برای عبور شیء وارد نشده است");
      } else if (object + input.clearanceMm < opening) {
        passed.push(`${label}: ${object + input.clearanceMm} میلی‌متر با فاصله آزاد، کمتر از ${opening} میلی‌متر`);
      } else {
        failed.push(`${label}: ${object + input.clearanceMm} میلی‌متر با فاصله آزاد، کمتر از ${opening} میلی‌متر نیست`);
      }
    }
  }
  if (facts.tunnelHeightMm === null) missing.push("ارتفاع مفید دهانه در منبع سازنده مشخص نشده است");

  const siteComparisons = [
    ["عرض مسیر تحویل", input.pathWidthMm, facts.outerWidthMm],
    ["ارتفاع مسیر تحویل", input.pathHeightMm, facts.outerHeightMm],
  ] as const;

  for (const [label, route, machine] of siteComparisons) {
    if (route === null) missing.push(`${label} وارد نشده است`);
    if (machine === null) missing.push(`بعد متناظر دستگاه برای ${label} در منبع موجود نیست`);
    if (route !== null && machine !== null) {
      if (input.handlingClearanceMm === null) {
        missing.push("فضای جابه‌جایی هنگام تحویل وارد نشده است");
      } else if (machine + input.handlingClearanceMm <= route) {
        passed.push(`${label}: ${machine + input.handlingClearanceMm} میلی‌متر در محدوده ${route} میلی‌متر`);
      } else {
        failed.push(`${label}: ${machine + input.handlingClearanceMm} میلی‌متر بیشتر از محدوده ${route} میلی‌متر`);
      }
    }
  }

  const placementComparisons = [
    ["عرض فضای نصب", input.placementWidthMm, facts.outerWidthMm],
    ["طول فضای نصب", input.placementLengthMm, facts.outerLengthMm],
    ["ارتفاع محل نصب", input.placementHeightMm, facts.outerHeightMm],
  ] as const;

  for (const [label, site, machine] of placementComparisons) {
    if (site === null) missing.push(`${label} وارد نشده است`);
    if (machine === null) missing.push(`بعد دستگاه برای ${label} در منبع موجود نیست`);
    if (site !== null && machine !== null) {
      if (input.handlingClearanceMm === null) {
        missing.push("فضای جابه‌جایی/نصب دستگاه وارد نشده است");
      } else if (machine + input.handlingClearanceMm <= site) {
        passed.push(`${label}: ${machine + input.handlingClearanceMm} میلی‌متر در محدوده ${site} میلی‌متر`);
      } else {
        failed.push(`${label}: ${machine + input.handlingClearanceMm} میلی‌متر بیشتر از محدوده ${site} میلی‌متر`);
      }
    }
  }

  const status = failed.length ? "does-not-fit" : missing.length ? "needs-review" : "fits";
  return { status, passed, failed, missing: [...new Set(missing)] };
}

export function describeFlowRequirement(requiredItemsPerHour: number | null): string {
  return requiredItemsPerHour === null
    ? "نرخ اوج موردنیاز ثبت نشده است."
    : `نرخ اوج موردنیاز شما: ${requiredItemsPerHour.toLocaleString("fa-IR")} قلم در ساعت؛ این عدد نیاز پروژه است و پیش‌بینی ظرفیت دستگاه نیست.`;
}
