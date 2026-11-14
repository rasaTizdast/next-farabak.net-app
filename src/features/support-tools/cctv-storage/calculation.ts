import type { CameraGroupFieldErrors, CameraGroupInput, CctvStorageResult } from "./types";

const SECONDS_PER_HOUR = 3_600;
const BYTES_PER_GIGABYTE = 1_000_000_000;

export function validateCctvStorageInputs(
  groups: CameraGroupInput[],
  headroomPercent: number
): { groupErrors: Record<string, CameraGroupFieldErrors>; headroomError?: string } {
  const groupErrors: Record<string, CameraGroupFieldErrors> = {};
  for (const group of groups) {
    const errors: CameraGroupFieldErrors = {};
    const finite = (value: number | null | undefined) =>
      typeof value === "number" && Number.isFinite(value);
    if (!finite(group.cameraCount) || group.cameraCount! <= 0)
      errors.cameraCount = "تعداد دوربین باید عددی بیشتر از صفر باشد.";
    if (!finite(group.averageBitrateMbps) || group.averageBitrateMbps! <= 0) {
      errors.averageBitrateMbps =
        group.bitrateSource === "unknown"
          ? "برای محاسبه، نرخ بیت هر دوربین را وارد کنید یا یک برآورد تقریبی انتخاب کنید."
          : "نرخ بیت باید عددی بیشتر از صفر باشد.";
    }
    if (
      !finite(group.recordingHoursPerDay) ||
      group.recordingHoursPerDay! <= 0 ||
      group.recordingHoursPerDay! > 24
    ) {
      errors.recordingHoursPerDay = "ساعت ضبط روزانه باید بیشتر از صفر و حداکثر ۲۴ باشد.";
    }
    if (!finite(group.retentionDays) || group.retentionDays! <= 0)
      errors.retentionDays = "مدت نگهداری باید بیشتر از صفر باشد.";
    if (
      group.recordingMode === "motion" &&
      (!finite(group.motionDutyCycle) || group.motionDutyCycle! <= 0 || group.motionDutyCycle! > 1)
    ) {
      errors.motionDutyCycle =
        "برای ضبط حرکتی، سهم زمان ضبط را بین بیشتر از صفر تا ۱۰۰٪ مشخص کنید.";
    }
    if (Object.keys(errors).length) groupErrors[group.id] = errors;
  }
  const headroomError =
    Number.isFinite(headroomPercent) && headroomPercent >= 0 && headroomPercent <= 100
      ? undefined
      : "فضای رزرو باید بین صفر تا ۱۰۰ درصد باشد.";
  return { groupErrors, headroomError };
}

export function calculateCctvStorage(
  groups: CameraGroupInput[],
  headroomPercent: number
): CctvStorageResult {
  const validation = validateCctvStorageInputs(groups, headroomPercent);
  if (Object.keys(validation.groupErrors).length || validation.headroomError) {
    throw new RangeError("ورودی‌های برآورد معتبر نیستند.");
  }
  const results = groups.map((group) => {
    const dutyCycle = group.recordingMode === "motion" ? (group.motionDutyCycle ?? 0) : 1;
    const secondsPerCameraPerDay = group.recordingHoursPerDay! * SECONDS_PER_HOUR * dutyCycle;
    const dailyGb =
      (((group.averageBitrateMbps! * 1_000_000) / 8) *
        secondsPerCameraPerDay *
        group.cameraCount!) /
      BYTES_PER_GIGABYTE;
    return {
      id: group.id,
      label: group.label,
      dailyGb,
      storageGb: dailyGb * group.retentionDays!,
      bandwidthMbps: group.averageBitrateMbps! * group.cameraCount!,
      bitrateLabel: group.bitrateLabel ?? "نرخ واردشده",
    };
  });
  const totalStorageGb = results.reduce((sum, group) => sum + group.storageGb, 0);
  const dailyGb = results.reduce((sum, group) => sum + group.dailyGb, 0);
  const bandwidthMbps = results.reduce((sum, group) => sum + group.bandwidthMbps, 0);
  const assumptions = [
    "هر گیگابایت بر پایه یک میلیارد بایت محاسبه شده است.",
    "نرخ بیت ورودی، میانگین تقریبی هر دوربین است.",
    "فضای رزرو فقط به ظرفیت برنامه‌ریزی‌شده افزوده می‌شود.",
    ...groups
      .filter((group) => group.bitrateSource === "rough-preset")
      .map((group) => `${group.label}: ${group.bitrateLabel ?? "برآورد تقریبی"}.`),
    ...groups
      .filter((group) => group.recordingMode === "motion")
      .map(
        (group) =>
          `${group.label}: سهم ضبط حرکتی ${(group.motionDutyCycle ?? 0) * 100}٪ در نظر گرفته شده است.`
      ),
  ];
  return {
    groups: results,
    totalStorageGb,
    plannedStorageGb: totalStorageGb * (1 + headroomPercent / 100),
    dailyGb,
    bandwidthMbps,
    assumptions,
  };
}
