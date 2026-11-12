import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const THRESHOLDS = {
  "largest-contentful-paint": { limit: 2500, unit: "millisecond", label: "LCP" },
  "interaction-to-next-paint": { limit: 200, unit: "millisecond", label: "INP" },
  "cumulative-layout-shift": { limit: 0.1, unit: "unitless", label: "CLS" },
};

const reportPath = resolve(process.argv[2] ?? "lighthouse.json");

function toMilliseconds(audit, value) {
  const unit = audit?.numericUnit ?? audit?.unit ?? "millisecond";
  if (unit === "second" || unit === "s") return value * 1000;
  return value;
}

function main() {
  let report;
  try {
    report = JSON.parse(readFileSync(reportPath, "utf8"));
  } catch (error) {
    console.error(`[web-vitals] Cannot read Lighthouse report "${reportPath}": ${error.message}`);
    console.error(
      "[web-vitals] Run: npx lighthouse --output=json --output-path=lighthouse.json http://localhost:3000"
    );
    process.exit(2);
  }

  const audits = report.audits ?? {};
  const failures = [];
  const results = [];

  for (const [auditId, rule] of Object.entries(THRESHOLDS)) {
    const audit = audits[auditId];
    const value = audit?.numericValue;

    if (value === undefined || value === null || !Number.isFinite(value)) {
      results.push(`  ${rule.label.padEnd(4)}: not applicable (no numeric value)`);
      continue;
    }

    const normalized = toMilliseconds(audit, value);
    const violated = rule.unit === "unitless" ? normalized >= rule.limit : normalized >= rule.limit;

    results.push(
      `  ${rule.label.padEnd(4)}: ${formatValue(normalized, rule.unit)} ${rule.unit === "unitless" ? "" : "ms"} ${violated ? "FAIL" : "ok"}`
    );

    if (violated) {
      failures.push(
        `${rule.label} ${formatValue(normalized, rule.unit)} ${rule.unit === "unitless" ? "" : "ms"} >= ${rule.limit}${rule.unit === "unitless" ? "" : " ms"}`
      );
    }
  }

  console.log(`[web-vitals] Threshold check for ${reportPath}`);
  console.log(results.join("\n"));

  if (failures.length > 0) {
    console.error(`[web-vitals] FAILED: ${failures.join("; ")}`);
    process.exit(1);
  }

  console.log("[web-vitals] PASS");
  process.exit(0);
}

function formatValue(value, unit) {
  if (unit === "unitless") return value.toFixed(3);
  return String(Math.round(value));
}

main();
