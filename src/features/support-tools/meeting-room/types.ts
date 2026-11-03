export type MeetingUse = "slides" | "video" | "hybrid";
export type DisplayType = "unknown" | "screen" | "projector";

export interface RoomInput {
  widthM: number;
  lengthM: number;
  nearestSeatM: number;
  furthestSeatM: number;
  seats: number;
  use: MeetingUse;
  daylightControlled: boolean;
  displayType: DisplayType;
  imageWidthM?: number;
  throwRatio?: number;
}

export interface MeetingRoomResult {
  minDiagonalIn: number;
  maxDiagonalIn: number;
  method: string;
  assumptions: string[];
  reasons: string[];
  throwDistanceM?: { min: number; max: number };
}
