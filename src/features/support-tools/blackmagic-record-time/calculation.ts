import type { RecordingPlanCalculation, RecordingPlanInput } from "./types";

const isPositiveFinite = (value: number) => Number.isFinite(value) && value > 0;

export function calculateRecordMinutes(capacityGb: number, rateMbPerSecond: number): number | null {
  if (!isPositiveFinite(capacityGb) || !isPositiveFinite(rateMbPerSecond)) return null;
  return (capacityGb * 1000) / (rateMbPerSecond * 60);
}

export function calculateShootCapacity(
  durationMinutes: number,
  rateMbPerSecond: number,
  safetyMarginPercent: number
): number | null {
  if (
    !isPositiveFinite(durationMinutes) ||
    !isPositiveFinite(rateMbPerSecond) ||
    !Number.isFinite(safetyMarginPercent) ||
    safetyMarginPercent < 0 ||
    safetyMarginPercent > 100
  ) {
    return null;
  }
  return ((durationMinutes * 60 * rateMbPerSecond) / 1000) * (1 + safetyMarginPercent / 100);
}

export function calculateTotalDataRate(rateMbPerSecond: number, cardCount: number): number | null {
  if (!isPositiveFinite(rateMbPerSecond) || !Number.isInteger(cardCount) || cardCount < 1) return null;
  return rateMbPerSecond * cardCount;
}

export function calculateRecordingPlan(input: RecordingPlanInput): RecordingPlanCalculation | null {
  const {
    capacityGb,
    cardCount,
    rateMbPerSecond,
    durationMinutes,
    safetyMarginPercent,
  } = input;
  if (!Number.isInteger(cardCount) || cardCount < 1) return null;
  const minutesPerCard = calculateRecordMinutes(capacityGb, rateMbPerSecond);
  const requiredCapacityGb = calculateShootCapacity(
    durationMinutes,
    rateMbPerSecond,
    safetyMarginPercent
  );
  if (minutesPerCard === null || requiredCapacityGb === null) return null;
  const totalMediaGb = capacityGb * cardCount;
  const estimatedDataGb = (durationMinutes * 60 * rateMbPerSecond) / 1000;
  return {
    minutesPerCard,
    totalRecordMinutes: minutesPerCard * cardCount,
    estimatedDataGb,
    requiredCapacityGb,
    requiredCardCount: Math.ceil(requiredCapacityGb / capacityGb),
    covered: totalMediaGb >= requiredCapacityGb,
  };
}
