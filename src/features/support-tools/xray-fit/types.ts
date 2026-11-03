export type Dimension = number | null;

export interface ScannerFitFacts {
  productId: number;
  name: string;
  href: string;
  tunnelWidthMm: Dimension;
  tunnelHeightMm: Dimension;
  outerWidthMm: Dimension;
  outerLengthMm: Dimension;
  outerHeightMm: Dimension;
  conveyorSpeedMps: Dimension;
  sourceLabel: string;
}

export interface SiteFitInput {
  objectWidthMm: Dimension;
  objectHeightMm: Dimension;
  objectDepthMm: Dimension;
  clearanceMm: Dimension;
  entranceWidthMm: Dimension;
  entranceHeightMm: Dimension;
  pathWidthMm: Dimension;
  pathHeightMm: Dimension;
  placementWidthMm: Dimension;
  placementLengthMm: Dimension;
  placementHeightMm: Dimension;
  handlingClearanceMm: Dimension;
  requiredItemsPerHour: Dimension;
  setting: string;
  notes: string;
}

export type FieldKey = Exclude<keyof SiteFitInput, "setting" | "notes">;

export type FitStatus = "fits" | "does-not-fit" | "needs-review";

export interface FitResult {
  status: FitStatus;
  passed: string[];
  failed: string[];
  missing: string[];
}
