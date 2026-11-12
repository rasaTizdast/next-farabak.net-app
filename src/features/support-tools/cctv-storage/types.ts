export type BitrateSource = "entered" | "rough-preset" | "unknown";

export type CameraGroupInput = {
  id: string;
  label: string;
  cameraCount: number | null;
  averageBitrateMbps: number | null;
  bitrateSource: BitrateSource;
  bitrateLabel?: string;
  recordingHoursPerDay: number | null;
  retentionDays: number | null;
  recordingMode: "continuous" | "motion";
  motionDutyCycle?: number | null;
};

export type CctvStorageGroupResult = {
  id: string;
  label: string;
  storageGb: number;
  dailyGb: number;
  bandwidthMbps: number;
  bitrateLabel: string;
};

export type CctvStorageResult = {
  groups: CctvStorageGroupResult[];
  totalStorageGb: number;
  plannedStorageGb: number;
  dailyGb: number;
  bandwidthMbps: number;
  assumptions: string[];
};

export type CameraGroupFieldErrors = Partial<
  Record<"cameraCount" | "averageBitrateMbps" | "recordingHoursPerDay" | "retentionDays" | "motionDutyCycle", string>
>;
