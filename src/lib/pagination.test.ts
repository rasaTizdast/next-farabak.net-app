import { describe, expect, it } from "vitest";

import { parsePositivePageNumber } from "./pagination";

describe("parsePositivePageNumber", () => {
  it.each([
    ["1", 1],
    ["02", 2],
    ["999", 999],
  ])("parses %s as a positive page number", (value, expected) => {
    expect(parsePositivePageNumber(value)).toBe(expected);
  });

  it.each(["0", "-1", "1.5", "1x", "", "9007199254740992"])(
    "rejects invalid page segment %s",
    (value) => {
      expect(parsePositivePageNumber(value)).toBeNull();
    }
  );
});
