import type { MeetingRoomResult, RoomInput } from "./types";
import { SIZING_METHOD } from "./sizing-method";

const diagonalToWidth = (inches: number) => (inches * 0.0254 * 16) / Math.sqrt(16 ** 2 + 9 ** 2);
const widthToDiagonal = (meters: number) => (meters / 0.0254) * (Math.sqrt(16 ** 2 + 9 ** 2) / 16);
export const metersToFeet = (meters: number) => meters * 3.28084;
export const feetToMeters = (feet: number) => feet / 3.28084;

export function validateRoom(input: RoomInput): string[] {
  const errors: string[] = [];
  if (input.widthM < 2 || input.widthM > 20) errors.push("عرض اتاق باید بین ۲ تا ۲۰ متر باشد.");
  if (input.lengthM < 2 || input.lengthM > 30) errors.push("طول اتاق باید بین ۲ تا ۳۰ متر باشد.");
  if (input.nearestSeatM < 0.5 || input.nearestSeatM >= input.furthestSeatM) errors.push("فاصلهٔ نزدیک‌ترین صندلی باید کمتر از دورترین صندلی باشد.");
  if (input.furthestSeatM > input.lengthM) errors.push("فاصلهٔ دورترین صندلی نمی‌تواند از طول اتاق بیشتر باشد.");
  if (input.seats < 1 || input.seats > 500) errors.push("تعداد صندلی باید بین ۱ تا ۵۰۰ باشد.");
  if (input.displayType === "projector" && input.imageWidthM !== undefined && input.imageWidthM <= 0) errors.push("عرض تصویر باید بیشتر از صفر باشد.");
  if (input.throwRatio !== undefined && input.throwRatio <= 0) errors.push("نسبت پرتاب باید بیشتر از صفر باشد.");
  return errors;
}

export function calculateMeetingRoom(input: RoomInput): MeetingRoomResult {
  const distance = input.furthestSeatM;
  const inScope = input.seats >= 8 && input.seats <= 30 && distance >= 2 && distance <= 12;
  const minDiagonalIn = inScope ? 100 : 100;
  const maxDiagonalIn = inScope ? 150 : 150;
  const reasons: string[] = [];
  if (distance < 2 || distance > 12) reasons.push("فاصلهٔ دورترین صندلی خارج از دامنهٔ بررسی تقریبی است.");
  if (input.seats < 8 || input.seats > 30) reasons.push("تعداد صندلی‌ها خارج از مثال ۸ تا ۳۰ نفرهٔ منبع است.");
  if (input.use === "slides") reasons.push("متن ریز و جدول‌ها ممکن است به نمایشگر بزرگ‌تر یا جایگاه‌بندی دوباره نیاز داشته باشند.");
  if (input.use === "hybrid") reasons.push("میدان دید دوربین، کادر شرکت‌کنندگان و محل نمایشگر باید جداگانه بررسی شود.");
  if (!input.daylightControlled) reasons.push("نور روز و بازتاب پنجره‌ها می‌توانند کنتراست تصویر را کاهش دهند.");
  if (input.seats > 20) reasons.push("برای بیش از ۲۰ نفر، زاویهٔ دید ردیف‌های کناری نیز باید بررسی شود.");
  const assumptions = [
    "منبع برای جمع‌های ۸ تا ۳۰ نفره، اندازهٔ تصویر ۱۰۰ تا ۱۵۰ اینچ را به‌عنوان مثال عمومی ذکر می‌کند؛ این مقدار با فاصلهٔ صندلی‌ها محاسبه نشده است.",
    "این مقایسه، خوانایی متن، وضوح، زاویهٔ صندلی‌ها یا توان روشنایی را تضمین نمی‌کند.",
  ];
  if (input.displayType === "projector") assumptions.push("اندازهٔ پرده به‌تنهایی سازگاری پروژکتور را مشخص نمی‌کند؛ نسبت پرتاب و روشنایی باید از برگهٔ همان مدل بررسی شود.");
  const result: MeetingRoomResult = { minDiagonalIn, maxDiagonalIn, method: SIZING_METHOD, assumptions, reasons };
  if (input.displayType === "projector" && input.imageWidthM && input.throwRatio) {
    const distanceM = input.imageWidthM * input.throwRatio;
    result.throwDistanceM = { min: distanceM * 0.95, max: distanceM * 1.05 };
  }
  return result;
}
