import jalaali from "jalali-moment";

/**
 * Get current Jalali date in YYYY-MM-DD format
 * @returns {string} Current Jalali date in format like "1404-06-23"
 */
export const getCurrentJalaliDate = (): string => {
  const now = jalaali();
  const year = now.jYear();
  const month = String(now.jMonth() + 1).padStart(2, "0"); // jMonth() returns 0-based month
  const day = String(now.jDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * Get current Jalali date and time in YYYY-MM-DDTHH:mm:ss format
 * @returns {string} Current Jalali date and time in format like "1404-06-23T14:30:45"
 */
export const getCurrentJalaliDateTime = (): string => {
  const now = jalaali();
  const year = now.jYear();
  const month = String(now.jMonth() + 1).padStart(2, "0");
  const day = String(now.jDate()).padStart(2, "0");
  const hour = String(now.hour()).padStart(2, "0");
  const minute = String(now.minute()).padStart(2, "0");
  const second = String(now.second()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
};

/**
 * Format a Jalali date string to a more readable Persian format
 * @param {string} jalaliDateString - Jalali date in YYYY-MM-DD format
 * @param {boolean} includeTime - Whether to include time if available
 * @returns {string} Formatted Persian date
 */
export const formatJalaliDate = (
  jalaliDateString: string,
  includeTime: boolean = false
): string => {
  if (!jalaliDateString) return "تاریخ نامشخص";

  try {
    // Handle ISO format Jalali date (e.g., "1404-06-23T14:30:45")
    if (jalaliDateString.includes("T")) {
      const [datePart, timePart] = jalaliDateString.split("T");
      const [year, month, day] = datePart.split("-").map(Number);
      const [hour, minute, second] = timePart.split(":").map(Number);

      const jalaliMoment = jalaali()
        .jYear(year)
        .jMonth(month - 1) // Convert to 0-based month
        .jDate(day)
        .hour(hour)
        .minute(minute)
        .second(second || 0);

      if (includeTime) {
        return jalaliMoment.format("jYYYY/jMM/jDD - HH:mm:ss");
      } else {
        return jalaliMoment.format("jYYYY/jMM/jDD");
      }
    }

    // Handle date-only format (e.g., "1404-06-23")
    const [year, month, day] = jalaliDateString.split("-").map(Number);
    const jalaliMoment = jalaali()
      .jYear(year)
      .jMonth(month - 1) // Convert to 0-based month
      .jDate(day);

    return jalaliMoment.format("jYYYY/jMM/jDD");
  } catch (error) {
    console.error("Error formatting Jalali date:", error);
    return jalaliDateString || "تاریخ نامشخص";
  }
};

/**
 * Convert a Gregorian date to Jalali date string
 * @param {Date} gregorianDate - Gregorian date object
 * @returns {string} Jalali date in YYYY-MM-DD format
 */
export const gregorianToJalali = (gregorianDate: Date): string => {
  const jalaliMoment = jalaali(gregorianDate);
  const year = jalaliMoment.jYear();
  const month = String(jalaliMoment.jMonth() + 1).padStart(2, "0");
  const day = String(jalaliMoment.jDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
