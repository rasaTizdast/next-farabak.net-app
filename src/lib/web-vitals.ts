import {
  CLSThresholds,
  INPThresholds,
  LCPThresholds,
  onCLS,
  onINP,
  onLCP,
  type MetricType,
} from "web-vitals";

export const WEB_VITALS_THRESHOLDS = {
  LCP: LCPThresholds[0],
  INP: INPThresholds[0],
  CLS: CLSThresholds[0],
} as const;

export type WebVitalsMetricName = keyof typeof WEB_VITALS_THRESHOLDS;

export function isPoorMetric(metric: { name: string; value: number }): boolean {
  const threshold = WEB_VITALS_THRESHOLDS[metric.name as WebVitalsMetricName];
  if (threshold === undefined) return false;
  return metric.value > threshold;
}

interface WebVitalsEventData {
  value: number;
  delta: number;
  rating: string;
  id: string;
  navigationType: string;
}

function sendToGoogleAnalytics(metric: MetricType, data: WebVitalsEventData): void {
  if (typeof window === "undefined") return;

  const gtag = (window as any).gtag;
  if (typeof gtag !== "function") return;

  gtag("event", "web_vitals", {
    event_category: "Web Vitals",
    event_label: metric.name,
    metric_name: metric.name,
    metric_value: metric.value,
    metric_delta: data.delta,
    metric_rating: data.rating,
    metric_id: data.id,
    metric_navigation_type: data.navigationType,
    non_interaction: true,
    value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
  });
}

function sendToUmami(metric: MetricType, data: WebVitalsEventData): void {
  if (typeof window === "undefined") return;

  const umami = (window as any).umami;
  if (!umami) return;

  const eventName = `web_vitals_${metric.name}`;
  const payload = {
    value: metric.value,
    delta: data.delta,
    rating: data.rating,
    id: data.id,
    navigationType: data.navigationType,
  };

  if (typeof umami === "function") {
    umami(eventName, payload);
  } else if (typeof umami.track === "function") {
    umami.track(eventName, payload);
  }
}

export function reportWebVitals(metric: MetricType): void {
  if (!isPoorMetric(metric)) return;

  const data: WebVitalsEventData = {
    value: metric.value,
    delta: metric.delta,
    rating: metric.rating,
    id: metric.id,
    navigationType: metric.navigationType,
  };

  sendToGoogleAnalytics(metric, data);
  sendToUmami(metric, data);
}

let initialized = false;

export function initWebVitals(): void {
  if (typeof window === "undefined") return;
  if (initialized) return;
  initialized = true;

  onLCP(reportWebVitals);
  onINP(reportWebVitals);
  onCLS(reportWebVitals);
}
