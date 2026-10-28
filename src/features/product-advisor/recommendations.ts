import type {
  AdvisorAnswer,
  AdvisorCategoryDefinition,
  AdvisorProductSnapshot,
  AdvisorRecommendation,
  AdvisorRecommendationSet,
  AdvisorRule,
} from "./types";

function includesAcceptedValue(value: string, acceptedValues: readonly string[]) {
  const normalizedValue = value.toLocaleLowerCase("fa-IR");
  return acceptedValues.some((acceptedValue) =>
    normalizedValue.includes(acceptedValue.toLocaleLowerCase("fa-IR"))
  );
}

function selectedAnswer(answer: AdvisorAnswer | undefined, optionId: string) {
  if (!answer || answer.value === "unknown") return false;
  return Array.isArray(answer.value) ? answer.value.includes(optionId) : answer.value === optionId;
}

function ruleEvidence(
  product: AdvisorProductSnapshot,
  rule: AdvisorRule,
  answer: AdvisorAnswer | undefined
): Pick<AdvisorRecommendation, "matched" | "tradeoffs" | "unknown" | "sourceLabels"> {
  if (!selectedAnswer(answer, rule.optionId)) {
    return { matched: [], tradeoffs: [], unknown: [], sourceLabels: [] };
  }

  const spec = product.specs.find((candidate) => candidate.key === rule.specKey);
  if (!spec) {
    return { matched: [], tradeoffs: [], unknown: [rule.evidenceLabel], sourceLabels: [] };
  }

  if (!includesAcceptedValue(spec.value, rule.acceptedValues)) {
    return {
      matched: [],
      tradeoffs: [
        rule.tradeoff ?? `نیاز «${rule.evidenceLabel}» در مشخصات ثبت‌شده تأیید نشده است.`,
      ],
      unknown: [],
      sourceLabels: [spec.sourceLabel],
    };
  }

  return {
    matched: [rule.evidenceLabel],
    tradeoffs: [],
    unknown: [],
    sourceLabels: [spec.sourceLabel],
  };
}

export function recommendProducts(
  definition: AdvisorCategoryDefinition,
  products: readonly AdvisorProductSnapshot[],
  answers: readonly AdvisorAnswer[]
): AdvisorRecommendationSet {
  const answersByQuestion = new Map(answers.map((answer) => [answer.questionId, answer]));
  const candidates = products
    .map<AdvisorRecommendation>((product) => {
      const evidence = definition.rules.map((rule) =>
        ruleEvidence(product, rule, answersByQuestion.get(rule.questionId))
      );
      return {
        product,
        matched: evidence.flatMap((item) => item.matched),
        tradeoffs: evidence.flatMap((item) => item.tradeoffs),
        unknown: evidence.flatMap((item) => item.unknown),
        sourceLabels: [...new Set(evidence.flatMap((item) => item.sourceLabels))],
      };
    })
    .sort(
      (left, right) =>
        right.matched.length - left.matched.length || left.unknown.length - right.unknown.length
    )
    .slice(0, 4);

  const hasEnoughVerifiedEvidence = candidates.some((candidate) => candidate.matched.length >= 2);
  return { mode: hasEnoughVerifiedEvidence ? "ranked" : "narrowed", candidates };
}
