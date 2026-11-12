import { describe, expect, it } from "vitest";

import { WEB_VITALS_THRESHOLDS, isPoorMetric } from "@/lib/web-vitals";

describe("src/lib/web-vitals.ts", () => {
  describe("WEB_VITALS_THRESHOLDS", () => {
    it("uses the standard Core Web Vitals good thresholds", () => {
      expect(WEB_VITALS_THRESHOLDS.LCP).toBe(2500);
      expect(WEB_VITALS_THRESHOLDS.INP).toBe(200);
      expect(WEB_VITALS_THRESHOLDS.CLS).toBe(0.1);
    });
  });

  describe("isPoorMetric", () => {
    it("reports LCP above 2500ms as poor", () => {
      expect(isPoorMetric({ name: "LCP", value: 2400 })).toBe(false);
      expect(isPoorMetric({ name: "LCP", value: 2500 })).toBe(false);
      expect(isPoorMetric({ name: "LCP", value: 2600 })).toBe(true);
    });

    it("reports INP above 200ms as poor", () => {
      expect(isPoorMetric({ name: "INP", value: 199 })).toBe(false);
      expect(isPoorMetric({ name: "INP", value: 201 })).toBe(true);
    });

    it("reports CLS above 0.1 as poor", () => {
      expect(isPoorMetric({ name: "CLS", value: 0.05 })).toBe(false);
      expect(isPoorMetric({ name: "CLS", value: 0.11 })).toBe(true);
    });

    it("returns false for unknown metric names", () => {
      expect(isPoorMetric({ name: "FCP", value: 5000 })).toBe(false);
      expect(isPoorMetric({ name: "TTFB", value: 9999 })).toBe(false);
    });
  });
});
