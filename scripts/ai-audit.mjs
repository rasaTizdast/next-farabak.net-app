import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPTS_DIR = path.join(ROOT, "scripts");
const SRC_DIR = path.join(ROOT, "src");
const PUBLIC_DIR = path.join(ROOT, "public");
const LLMS_PATH = path.join(PUBLIC_DIR, "llms.txt");
const ROBOTS_TS_PATH = path.join(SRC_DIR, "app", "robots.ts");
const PUBLIC_ROBOTS_PATH = path.join(PUBLIC_DIR, "robots.txt");
const PACKAGE_JSON_PATH = path.join(ROOT, "package.json");
const REPORT_PATH = path.join(ROOT, "reports", "ai-seo-audit.md");

const SCAN_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js", ".mjs", ".cjs"];
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "__tests__"]);

const AI_AGENT_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
  "PerplexityBot",
  "Applebot-Extended",
  "DeepSeekBot",
];

const REQUIRED_SCHEMA = [
  { label: "Organization", synonyms: ["Organization"] },
  { label: "WebSite or WebPage", synonyms: ["WebSite", "WebPage"] },
  { label: "LocalBusiness", synonyms: ["LocalBusiness"] },
  { label: "Product", synonyms: ["Product"] },
  { label: "FAQPage", synonyms: ["FAQPage"] },
  { label: "BlogPosting", synonyms: ["BlogPosting"] },
  { label: "BreadcrumbList", synonyms: ["BreadcrumbList"] },
  { label: "Person", synonyms: ["Person"] },
  { label: "CreativeWork or Article", synonyms: ["CreativeWork", "Article"] },
  { label: "CollectionPage", synonyms: ["CollectionPage"] },
  { label: "ContactPage", synonyms: ["ContactPage"] },
  { label: "AboutPage", synonyms: ["AboutPage"] },
];

const PROMPT_CHECKLIST = [
  {
    prompt: "فرابک چه برندهایی را وارد می‌کند؟",
    coverage:
      "llms.txt → Products / Company sections names Reolink, Smiths Detection, CEIA, BWDefend; answering URL: https://farabak.net/products",
  },
  {
    prompt: "Who is the owner of farabak.net?",
    coverage:
      "llms.txt summary + https://farabak.net/about-us (Organization schema) and /about-us/members (Person schema)",
  },
  {
    prompt: "فرابک کجاست و راه‌های تماس با آن چیست؟",
    coverage:
      "llms.txt Contact section (email info@farabak.net, Instagram, WhatsApp) + https://farabak.net/contact-us (LocalBusiness + ContactPage schema)",
  },
  {
    prompt: "چگونه وضعیت گارانتی محصول فرابک را پیگیری کنم؟",
    coverage:
      "https://farabak.net/support/warranty-tracking (linked from llms.txt Support section)",
  },
  {
    prompt: "قیمت دوربین مداربسته Reolink چقدر است؟",
    coverage:
      "https://farabak.net/products → product pages emit Product/Offer JSON-LD with pricing",
  },
  {
    prompt: "فرابک دستگاه ایکس‌ری و فلزیاب CEIA یا BWDefend دارد؟",
    coverage:
      "llms.txt brand list + https://farabak.net/products; CollectionPage schema on category/subcategory pages",
  },
  {
    prompt: "تفاوت دوربین‌های PoE و وای‌فای Reolink چیست؟",
    coverage: "https://farabak.net/support/blog article + BlogPosting schema and FAQPage accordion",
  },
];

async function readText(filePath) {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

async function collectFiles(dir) {
  const out = [];
  async function walk(current) {
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        await walk(full);
      } else if (SCAN_EXTENSIONS.some((ext) => entry.name.toLowerCase().endsWith(ext))) {
        out.push(full);
      }
    }
  }
  await walk(dir);
  return out;
}

function isProductionFile(filePath) {
  return !/\.(test|spec)\.(ts|tsx|js|jsx|mjs)$/.test(filePath);
}

function relPath(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join("/");
}

function markdownLink(label, url) {
  return `[${label}](${url})`;
}

function collectSchemaTypes(content) {
  const types = [];
  const re = /"@type"\s*:\s*("[^"]+"|\[[^\]]*\])/g;
  let match;
  while ((match = re.exec(content)) !== null) {
    const raw = match[1];
    if (raw.startsWith("[")) {
      const inner = raw.slice(1, -1);
      const nameRe = /"([^"]+)"/g;
      let nameMatch;
      while ((nameMatch = nameRe.exec(inner)) !== null) types.push(nameMatch[1]);
    } else {
      types.push(raw.slice(1, -1));
    }
  }
  return types;
}

function countInText(text, pattern) {
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
}

function countSyllables(word) {
  const groups = word.match(/[aeiouy]+/gi);
  return groups ? groups.length : 1;
}

function fleschReadingEase(sample) {
  const words = sample.match(/[A-Za-z]{2,}/g) || [];
  if (words.length < 30) return null;
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  const sentences =
    sample
      .split(/[.!?]+/)
      .map((part) => part.trim())
      .filter((part) => /[A-Za-z]/.test(part)).length || 1;
  const score = 206.835 - 1.015 * (words.length / sentences) - 84.6 * (syllables / words.length);
  return {
    score: Math.max(0, Math.min(100, score)),
    words: words.length,
    sentences,
  };
}

async function checkLlmsTxt() {
  const content = await readText(LLMS_PATH);
  if (content === null) {
    return {
      id: 1,
      title: "llms.txt presence & quality",
      status: "FAIL",
      notes: [
        `Missing ${markdownLink("public/llms.txt", relPath(LLMS_PATH))} — create it so AI systems have a parseable index of the site.`,
      ],
      items: [],
    };
  }

  const lineCount = content.split(/\r?\n/).filter((line) => line.trim() !== "").length;
  const items = [
    {
      label: "Site name / Persian content (فرابک or Arabic-script text present)",
      ok: /فرابک/.test(content) || /[\u0600-\u06FF]/.test(content),
    },
    {
      label: "Email address present",
      ok: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(content),
    },
    { label: 'Contains "https://farabak.net"', ok: content.includes("https://farabak.net") },
  ];

  const internalLinks = new Set();
  const linkRe = /\]\((https?:\/\/farabak\.net\/[^)]*)\)/g;
  let linkMatch;
  while ((linkMatch = linkRe.exec(content)) !== null) internalLinks.add(linkMatch[1]);
  items.push({
    label: `Internal farabak.net page links (found ${internalLinks.size})`,
    ok: internalLinks.size >= 4,
  });

  const brands = ["Reolink", "Smiths", "CEIA", "BWDefend"];
  const foundBrands = brands.filter((brand) => new RegExp(brand, "i").test(content));
  items.push({
    label: `Brand keywords Reolink|Smiths|CEIA|BWDefend (${foundBrands.length}/4 found)`,
    ok: foundBrands.length >= 1,
  });
  items.push({
    label: "Contact / social marker (instagram|wa.me)",
    ok: /instagram|wa\.me/i.test(content),
  });

  const okCount = items.filter((item) => item.ok).length;
  const allOk = okCount === items.length;
  const notes = [];
  if (allOk) {
    notes.push(
      "All llms.txt content markers are present — file is a strong machine-readable entry point."
    );
  } else {
    const missing = items.filter((item) => !item.ok).map((item) => item.label);
    notes.push(`Missing markers: ${missing.join("; ")}.`);
  }
  notes.push(
    `${lineCount} non-blank lines; ${foundBrands.length}/4 brand keywords (${foundBrands.join(", ") || "none"}); email ${items[1].ok ? "found" : "not found"}; ${internalLinks.size} internal farabak.net links.`
  );
  return {
    id: 1,
    title: "llms.txt presence & quality",
    status: allOk ? "PASS" : "WARN",
    notes,
    items: items.map((item) => ({
      ...item,
      label: `${item.ok ? "OK" : "MISSING"} — ${item.label}`,
    })),
  };
}

async function checkRobotsAccess() {
  const content = await readText(ROBOTS_TS_PATH);
  if (content === null) {
    return {
      id: 2,
      title: "AI-crawler access (robots)",
      status: "FAIL",
      notes: [
        "src/app/robots.ts not found — add a robots module that explicitly allows the common AI crawlers.",
      ],
      items: [],
    };
  }

  const shadow = (await readText(PUBLIC_ROBOTS_PATH)) !== null;
  const perBot = AI_AGENT_BOTS.map((bot) => {
    const re = new RegExp(`["']?${bot}["']?`, "g");
    const matches = [...content.matchAll(re)];
    if (matches.length === 0) return { bot, state: "absent" };
    let state = "allowed";
    for (const match of matches) {
      const segment = content.slice(match.index, match.index + 400);
      const disallowAt = segment.search(/disallow:\s*\/|Disallow:\s*\//);
      if (disallowAt !== -1) {
        const allowAt = segment.indexOf('allow: "/"');
        if (allowAt === -1 || allowAt > disallowAt) {
          state = "blocked";
          break;
        }
      }
    }
    return { bot, state };
  });

  const allowedCount = perBot.filter((entry) => entry.state === "allowed").length;
  const blocked = perBot.filter((entry) => entry.state === "blocked").map((entry) => entry.bot);
  const notes = [];
  if (allowedCount >= 3) {
    notes.push(
      `Robots.ts explicitly welcomes ${allowedCount}/8 common AI crawlers with allow: "/" rules.`
    );
  } else {
    notes.push(
      `Only ${allowedCount}/8 common AI crawlers are allowed — AI engines cannot cite blocked pages.`
    );
  }
  if (blocked.length > 0) notes.push(`Blocked AI crawlers: ${blocked.join(", ")}.`);
  if (shadow) {
    notes.push(
      "WARNING: public/robots.txt exists and would be served over src/app/robots.ts — delete it so the robots module is authoritative."
    );
  } else {
    notes.push("No public/robots.txt — src/app/robots.ts is the authoritative /robots.txt source.");
  }

  let status = "PASS";
  if (allowedCount < 3) status = "WARN";
  if (blocked.length > 0) status = "WARN";
  if (shadow) status = "WARN";

  return {
    id: 2,
    title: "AI-crawler access (robots)",
    status,
    notes,
    items: perBot.map((entry) => ({
      label: `${entry.bot}: ${entry.state}`,
      ok: entry.state === "allowed",
    })),
  };
}

async function checkStructuredData(fileList, fileContents) {
  const emitterFiles = [];
  const typeFiles = [];
  let ldjsonOccurrences = 0;

  for (const file of fileList) {
    if (!isProductionFile(file)) continue;
    const content = fileContents.get(file) || "";
    ldjsonOccurrences += countInText(content, /application\/ld\+json/g);
    if (/application\/ld\+json/.test(content)) emitterFiles.push(file);
    const types = collectSchemaTypes(content);
    if (types.length > 0) typeFiles.push(file);
  }

  const items = REQUIRED_SCHEMA.map((required) => {
    const found = typeFiles.some((file) => {
      const types = collectSchemaTypes(fileContents.get(file) || "");
      return required.synonyms.some((synonym) => types.includes(synonym));
    });
    return { label: required.label, ok: found };
  });

  const foundCount = items.filter((item) => item.ok).length;
  const notes = [];
  if (emitterFiles.length > 0) {
    notes.push(
      `${emitterFiles.length} production files emit application/ld+json (${ldjsonOccurrences} occurrences total).`
    );
  } else {
    notes.push("No application/ld+json emitter found in src/.");
  }
  notes.push(`${foundCount}/${items.length} required schema entity types are emitted.`);
  const sample = emitterFiles.slice(0, 8).map((file) => `\`${relPath(file)}\``);
  notes.push(`Emitter sample: ${sample.join(", ")}${emitterFiles.length > 8 ? ", …" : ""}`);
  const missing = items.filter((item) => !item.ok).map((item) => item.label);
  if (missing.length > 0) notes.push(`Missing entity types: ${missing.join("; ")}.`);

  return {
    id: 3,
    title: "Structured data presence & coverage",
    status: foundCount === items.length ? "PASS" : "WARN",
    notes,
    items: items.map((item) => ({
      label: `${item.ok ? "OK" : "MISSING"} — ${item.label}`,
      ok: item.ok,
    })),
  };
}

async function checkSemanticMarkup(fileList, fileContents) {
  let itemPropCount = 0;
  let dlCount = 0;
  for (const file of fileList) {
    if (!isProductionFile(file)) continue;
    const content = fileContents.get(file) || "";
    itemPropCount += countInText(content, /itemprop\s*=/gi);
    dlCount += countInText(content, /<dl[\s>]/gi);
  }
  const faqTsx = (await readText(path.join(SRC_DIR, "components", "Faq.tsx"))) !== null;
  const notes = [];
  const dlFaq = dlCount > 0;
  const semanticFaq =
    dlFaq ||
    faqTsx ||
    (await readText(path.join(SRC_DIR, "components", "BlogFaqAccordion.tsx"))) !== null;
  notes.push(
    `${itemPropCount} itemprop= attributes and ${dlCount} <dl> elements across production files in src/.`
  );
  if (faqTsx) notes.push("src/components/Faq.tsx exists.");
  if (!faqTsx && (dlFaq || semanticFaq)) {
    notes.push(
      "No components/Faq.tsx; semantic Q&A is instead served through FAQPage JSON-LD emitters (BlogFaqAccordion.tsx, FaqAccordion.tsx, ProductFaq.tsx)."
    );
  }
  if (itemPropCount === 0 && dlCount === 0) {
    notes.push(
      "itemprop microdata and <dl> definition-list FAQs are not used — rely on JSON-LD + FAQPage schema (see check 3)."
    );
  }

  const status = itemPropCount > 0 || dlCount > 0 ? "PASS" : "WARN";
  return {
    id: 4,
    title: "itemprop / semantic markup",
    status,
    notes,
    items: [
      { label: `itemprop= occurrences: ${itemPropCount}`, ok: itemPropCount > 0 },
      { label: `<dl> definition-list elements: ${dlCount}`, ok: dlCount > 0 },
      { label: "src/components/Faq.tsx present", ok: faqTsx },
    ],
  };
}

async function checkBlogExtractability(fileList, fileContents) {
  const blogDir = path.join(SRC_DIR, "app", "(main)", "support", "blog");
  const blogFiles = fileList.filter((file) => file.startsWith(blogDir));
  const blogContents = blogFiles.map((file) => fileContents.get(file) || "");
  const h1InBlog = blogContents.some((content) => /<h1[\s>]/i.test(content));
  const blogDetailFile = blogFiles.find((file) =>
    file.endsWith(path.join("[blogCategory]", "[blog]", "page.tsx"))
  );
  const detailContent = blogDetailFile ? fileContents.get(blogDetailFile) || "" : "";
  const detailHasBlogPosting = /BlogPosting/.test(detailContent);
  const detailHasFaq = /BlogFaqAccordion|FAQPage|faqs/.test(detailContent);
  const detailHasJsonLd = /application\/ld\+json/.test(detailContent);

  const notes = [];
  notes.push(
    `${blogFiles.length} blog files under (main)/support/blog; an <h1> is ${h1InBlog ? "rendered on" : "missing from"} the blog pages.`
  );
  if (blogDetailFile) {
    notes.push(
      `Blog detail page ${markdownLink(relPath(blogDetailFile), `#L`)} ${
        detailHasBlogPosting ? "declares" : "does not declare"
      } BlogPosting JSON-LD and ${detailHasFaq ? "references" : "omits"} FAQ content${detailHasJsonLd ? " via application/ld+json" : ""}.`
    );
  } else {
    notes.push("Blog detail route page.tsx was not located under (main)/support/blog.");
  }

  const ok = h1InBlog && detailHasBlogPosting && detailHasFaq && detailHasJsonLd;
  return {
    id: 5,
    title: "Blog & article extractability",
    status: ok ? "PASS" : "WARN",
    notes,
    items: [
      { label: "<h1> rendered in blog pages", ok: h1InBlog },
      { label: "Blog detail page emits BlogPosting JSON-LD", ok: detailHasBlogPosting },
      { label: "Blog detail page references FAQ (accordion / FAQPage)", ok: detailHasFaq },
      { label: "Blog detail page emits application/ld+json", ok: detailHasJsonLd },
    ],
  };
}

async function checkReadability() {
  const llmsText = await readText(LLMS_PATH);
  if (llmsText === null) {
    return {
      id: 6,
      title: "Content readability estimate",
      status: "INFO",
      notes: ["public/llms.txt unavailable — cannot sample text."],
      items: [],
    };
  }

  const sample = llmsText
    .split(/\r?\n/)
    .filter((line) => {
      const latin = (line.match(/[A-Za-z]/g) || []).length;
      const persian = (line.match(/[\u0600-\u06FF]/g) || []).length;
      return latin >= 2 && latin > persian * 2;
    })
    .join(" ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[()]/g, " ");

  const flesch = fleschReadingEase(sample);
  let description;
  if (flesch === null) {
    description =
      "n/a (Persian content) — llms.txt contains fewer than 30 usable English words; Flesch scoring is unreliable for Persian/Farsi.";
  } else if (flesch.score >= 60) {
    description = `${flesch.score.toFixed(1)} (plain English, easily extracted by AI)`;
  } else if (flesch.score >= 30) {
    description = `${flesch.score.toFixed(1)} (fairly difficult — consider simpler phrasing for extraction)`;
  } else {
    description = `${flesch.score.toFixed(1)} (difficult English)`;
  }

  const notes = [];
  notes.push(
    `Sample: English-heavy lines of public/llms.txt (${flesch ? `${flesch.words} words, ${flesch.sentences} sentences` : "not enough English words"}).`
  );
  notes.push(`Approximate Flesch Reading Ease: ${description}.`);
  notes.push(
    "Soft metric — Persian (RTL) content is the primary language; do not gate on this score."
  );

  return {
    id: 6,
    title: "Content readability estimate",
    status: "INFO",
    notes,
    items: [],
  };
}

async function checkMonitoringScripts() {
  const packageText = await readText(PACKAGE_JSON_PATH);
  const hasGenerateLlms = packageText !== null && /generate:llms/.test(packageText);
  const hasAiAudit = packageText !== null && /ai:audit/.test(packageText);
  const generateLlmsExists = (await readText(path.join(SCRIPTS_DIR, "generate-llms.mjs"))) !== null;
  const auditExists = (await readText(path.join(SCRIPTS_DIR, "ai-audit.mjs"))) !== null;

  const notes = [];
  if (packageText === null) {
    notes.push("package.json could not be read.");
  } else {
    notes.push(
      `package.json scripts → "generate:llms": ${hasGenerateLlms ? "present" : "MISSING"}, "ai:audit": ${hasAiAudit ? "present" : "MISSING"}.`
    );
  }
  notes.push(
    `scripts/generate-llms.mjs: ${generateLlmsExists ? "present" : "MISSING"}, scripts/ai-audit.mjs: ${auditExists ? "present" : "MISSING"}.`
  );
  if (!hasGenerateLlms || !generateLlmsExists) {
    notes.push(
      "llms.txt generation is not yet wired to an npm script (expected — added in a later step)."
    );
  }
  if (!hasAiAudit) {
    notes.push(
      'The "ai:audit" npm script is not yet in package.json — run this audit directly via `node scripts/ai-audit.mjs`.'
    );
  }

  const ok = (hasGenerateLlms && generateLlmsExists && hasAiAudit && auditExists) || false;
  const allFilesPresent = generateLlmsExists && auditExists;
  const status = hasGenerateLlms && hasAiAudit && allFilesPresent ? "PASS" : "WARN";
  return {
    id: 7,
    title: "Monitoring scripts presence",
    status,
    notes,
    items: [
      { label: '"generate:llms" in package.json scripts', ok: hasGenerateLlms },
      { label: '"ai:audit" in package.json scripts', ok: hasAiAudit },
      { label: "scripts/generate-llms.mjs exists", ok: generateLlmsExists },
      { label: "scripts/ai-audit.mjs exists", ok: auditExists },
    ],
  };
}

function checkPromptAbility() {
  return {
    id: 8,
    title: "Prompt-ability quick test (checklist)",
    status: "INFO",
    notes: [
      "Static checklist: each sample prompt below should be answerable from crawlable, schema-marked content. Verify manually in ChatGPT / Perplexity / AI Overviews.",
    ],
    items: PROMPT_CHECKLIST.map((entry) => ({
      label: `${entry.prompt} → ${entry.coverage}`,
      ok: true,
    })),
  };
}

function renderCheckItems(items) {
  return items.map((item) => `- ${item.label}${item.ok === false ? " ⚠" : ""}`).join("\n");
}

function renderCheckTable(results) {
  const header = "| # | Check | Status | Summary |";
  const divider = "|---:|---|---|---|";
  const rows = results.map((result) => {
    const summary = result.notes[0] ? result.notes[0].replace(/\|/g, "\\|") : "";
    return `| ${result.id} | ${result.title.replace(/\|/g, "\\|")} | ${result.status} | ${summary} |`;
  });
  return [header, divider, ...rows].join("\n");
}

async function buildReport(results, counts) {
  const date = new Date().toISOString().slice(0, 10);
  const sections = [];
  for (const result of results) {
    const noteLines = result.notes.map((note) => `- ${note}`).join("\n");
    const itemLines = renderCheckItems(result.items);
    sections.push(
      [
        `## ${result.id}. ${result.title} — ${result.status}`,
        "",
        noteLines,
        itemLines ? "" : null,
        itemLines || null,
      ]
        .filter((line) => line !== null)
        .join("\n")
    );
  }

  const summary = `**Summary:** PASS ${counts.PASS} · WARN ${counts.WARN} · FAIL ${counts.FAIL} · INFO ${counts.INFO}`;
  const content = [
    "# AI-SEO Audit — farabak.net (next-farabak-app)",
    "",
    `Generated: ${date} (UTC) — offline static audit; no network, no database, no build.`,
    "",
    "## Results",
    "",
    renderCheckTable(results),
    "",
    summary,
    "",
    "---",
    "",
    sections.join("\n\n"),
    "",
    summary,
    "",
    "## How to read this",
    "",
    "- **PASS** — the area is AI-ready; keep monitoring.",
    "- **WARN** — actionable gap worth fixing before relying on AI citations.",
    "- **INFO** — soft or informational metric; no action required.",
    "- Re-run any time with `node scripts/ai-audit.mjs` (npm alias `ai:audit` once wired in package.json).",
    "",
  ].join("\n");

  await mkdir(path.dirname(REPORT_PATH), { recursive: true });
  await writeFile(REPORT_PATH, content, "utf8");
  return content;
}

function pad(value, length) {
  const text = String(value);
  return text.length >= length ? text : text + " ".repeat(length - text.length);
}

function printConsole(results, counts) {
  const width = Math.max(...results.map((result) => result.title.length), 8);
  console.log("\nAI-SEO audit — farabak.net");
  console.log("=".repeat(width + 22));
  for (const result of results) {
    const detail = (result.notes[0] || "").replace(/\n/g, " ");
    console.log(
      `${pad(result.status, 5)} | ${pad(result.title, width)} | ${result.id} | ${detail.length > 120 ? detail.slice(0, 117) + "…" : detail}`
    );
  }
  console.log("=".repeat(width + 22));
  console.log(
    `Summary: ${counts.PASS} PASS · ${counts.WARN} WARN · ${counts.FAIL} FAIL · ${counts.INFO} INFO`
  );
  console.log(`Report written to reports/ai-seo-audit.md`);
}

async function main() {
  const fileList = await collectFiles(SRC_DIR);
  const fileContents = new Map();
  for (const file of fileList) {
    const content = await readText(file);
    fileContents.set(file, content || "");
  }

  const results = [
    await checkLlmsTxt(),
    await checkRobotsAccess(),
    await checkStructuredData(fileList, fileContents),
    await checkSemanticMarkup(fileList, fileContents),
    await checkBlogExtractability(fileList, fileContents),
    await checkReadability(),
    await checkMonitoringScripts(),
    checkPromptAbility(),
  ];

  const counts = { PASS: 0, WARN: 0, FAIL: 0, INFO: 0 };
  for (const result of results) counts[result.status] += 1;

  printConsole(results, counts);
  await buildReport(results, counts);
  process.exitCode = 0;
}

main().catch((error) => {
  console.error("AI-SEO audit failed:", error);
  process.exitCode = 1;
});
