import { relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const workspace = fileURLToPath(new URL("../../", import.meta.url));
const seoPrompt =
  /\b(?:seo|search console|gsc|serps?|googlebot|sitemaps?|robots\.txt|noindex|keyword research|keyword gaps?|(?:page|search) rankings?|rank tracking|index coverage|organic (?:search|traffic|visibility)|outrank\w*|(?:rank\w*|index\w*|show\w*|appear\w*)\b.{0,45}\b(?:google|search results))\b|سئو|سرچ[\s‌]*کنسول|ایندکس|کلمات\s+کلیدی|نتایج\s+(?:جستجو|گوگل)|رتبه.{0,30}گوگل|گوگل.{0,30}(?:نمایش|رتبه)/isu;

const routeChecks = [
  [
    /^(?:src\/app\/(?:robots|sitemap)\.|src\/app\/api\/sitemap\/|src\/lib\/data\/sitemap[.-]|public\/(?:robots\.txt|sitemap[^/]*\.xml)$)/,
    "robots rules, sitemap URL membership, and production coverage",
  ],
  [
    /^(?:next\.config\.|src\/proxy\.|src\/lib\/seo\/|src\/constants\/meta\.)/,
    "status codes, redirect targets, canonicals, and robots directives",
  ],
  [
    /^(?:src\/app\/(?:\(main\)\/|layout\.|not-found\.|_components\/ui\/(?:Breadcrumb|Pagination)\.)|src\/(?:content|components\/public)\/)/,
    "public route status, head metadata, rendered headings, and crawlable links",
  ],
];

let input = "";
process.stdin.setEncoding("utf8");
for await (const chunk of process.stdin) input += chunk;

const event = JSON.parse(input || "{}");
let additionalContext;

if (event.hook_event_name === "UserPromptSubmit" && seoPrompt.test(event.prompt ?? "")) {
  additionalContext =
    "For the Farabak SEO work in this request, use .agents/skills/farabak-seo/SKILL.md. Select the roles that fit the scope, and cite dated evidence for indexing, visibility, and competitor claims.";
}

if (event.hook_event_name === "PostToolUse" && event.tool_name === "apply_patch") {
  const patch = event.tool_input?.command ?? "";
  const paths = Array.from(
    patch.matchAll(/^\*\*\* (?:(?:Add|Delete|Update) File: |Move to: )([^\r\n]+)$/gm),
    ([, path]) => relative(workspace, resolve(event.cwd ?? workspace, path)).replaceAll("\\", "/")
  );
  const checks = routeChecks.filter(([match]) => paths.some((path) => match.test(path)));
  if (checks.length > 0) {
    additionalContext = `Search-facing patch detected. Verify ${checks.map(([, check]) => check).join("; ")} as applicable. Use the release checks in docs/seo-audits/workflow.md and report the environment tested.`;
  }
}

if (additionalContext) {
  console.log(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: event.hook_event_name, additionalContext },
    })
  );
}
