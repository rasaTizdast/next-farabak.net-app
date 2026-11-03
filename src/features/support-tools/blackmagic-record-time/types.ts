export type BlackmagicQuality = "constant-bitrate" | "constant-quality";

export interface BlackmagicRateFact {
  id: string;
  modelSlug: string;
  modelLabel: string;
  format: string;
  frameRate: number;
  codec: "Blackmagic RAW";
  quality: BlackmagicQuality;
  compression: string;
  minimumMbPerSecond: number;
  maximumMbPerSecond: number;
  sourceUrl: string;
  checkedDate: string;
}

export interface RecordingPlanInput {
  capacityGb: number;
  cardCount: number;
  rateMbPerSecond: number;
  durationMinutes: number;
  safetyMarginPercent: number;
}

export interface RecordingPlanCalculation {
  minutesPerCard: number;
  totalRecordMinutes: number;
  estimatedDataGb: number;
  requiredCapacityGb: number;
  requiredCardCount: number;
  covered: boolean;
}
