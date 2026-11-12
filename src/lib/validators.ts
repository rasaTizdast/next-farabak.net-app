const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function persianToEnglishDigits(str: string): string {
  return str.replace(/[۰-۹]/g, (d) => persianDigits.indexOf(d).toString());
}

export function formatDateToISOString(date: Date | null): string | null;
export function formatDateToISOString(date: Date): string;
export function formatDateToISOString(date: Date | null): string | null {
  if (!date) return null;
  const tehranDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Tehran" }));
  return tehranDate.toISOString().split("T")[0];
}

export function calculateDuration(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
}
