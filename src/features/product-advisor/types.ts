export type AdvisorAnswerValue = string | readonly string[] | "unknown";

export interface AdvisorAnswer {
  questionId: string;
  value: AdvisorAnswerValue;
}

export interface NormalizedAdvisorSpec {
  key: string;
  label: string;
  value: string;
  sourceLabel: string;
}

export interface AdvisorProductSnapshot {
  productId: number;
  categorySlug: string;
  subcategorySlug: string | null;
  name: string;
  model: string | null;
  sourceText: string;
  imageUrl: string | null;
  detailHref: string;
  specs: readonly NormalizedAdvisorSpec[];
}

export interface AdvisorQuestionOption {
  id: string;
  label: string;
  helper?: string;
}

export interface AdvisorQuestion {
  id: string;
  label: string;
  help?: string;
  type: "single" | "multiple";
  options: readonly AdvisorQuestionOption[];
}

export interface AdvisorSpecNormalizer {
  key: string;
  label: string;
  sourceLabels: readonly string[];
}

export interface AdvisorRule {
  questionId: string;
  optionId: string;
  specKey?: string;
  acceptedValues?: readonly string[];
  productKeywords?: readonly string[];
  evidenceLabel: string;
  tradeoff?: string;
}

export interface AdvisorCategoryDefinition {
  slug: string;
  label: string;
  intentIds: readonly string[];
  questions: readonly AdvisorQuestion[];
  normalizers: readonly AdvisorSpecNormalizer[];
  rules: readonly AdvisorRule[];
}

export interface AdvisorRecommendation {
  product: AdvisorProductSnapshot;
  matched: string[];
  tradeoffs: string[];
  unknown: string[];
  sourceLabels: string[];
}

export interface AdvisorRecommendationSet {
  mode: "ranked" | "narrowed";
  candidates: AdvisorRecommendation[];
}
