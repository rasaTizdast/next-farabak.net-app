import { describe, expect, it } from "vitest";

import { summarizeAdvisorAnswers } from "./answer-summary";

describe("summarizeAdvisorAnswers", () => {
  it("returns human-readable questions and answers in the configured order", () => {
    expect(
      summarizeAdvisorAnswers("reolink-cctv-camera", [
        { questionId: "night-detail", value: "high" },
        { questionId: "placement", value: "outdoor" },
      ])
    ).toEqual([
      { question: "دوربین کجا نصب می‌شود؟", answer: "فضای باز" },
      { question: "جزئیات تصویر شب چقدر مهم است؟", answer: "خیلی مهم" },
    ]);
  });
});
