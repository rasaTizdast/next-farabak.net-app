# Product Advisor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Build a no-AI, animated Persian product advisor that guides buyers through hard-coded category questions, preserves a comparison board, and exports a decision-report PDF.

**Architecture:** A server route loads only the chosen category's verified catalogue facts. A compact client workspace owns typed rule evaluation, progress motion, and a versioned local project state. A comparison board and report consume the same project state; PDF libraries load only after the visitor requests an export.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict mode, Tailwind CSS v4, motion/react, existing Radix primitives, Prisma, Vitest, Testing Library, html2canvas, jspdf.

**Spec:** docs/superpowers/specs/2026-10-28-product-advisor-design.md

## Global Constraints

- Do not add AI models, CopilotKit, a database write, contact collection, Telegram delivery, public share URLs, or a new dependency.
- Recommendation copy may only cite verified catalogue fields; use unknown for absent values and never imply stock, compatibility, compliance, installation suitability, or quotation status.
- Persist only the anonymous versioned AdvisorProject in local storage; never persist identity, authentication, free-form tracking, or contact data.
- Load a selected category once on the server; answer changes make zero requests.
- Use actual catalogue media, public RTL/gutter conventions, accessible controls, and reduced-motion-first animation.
- Preserve unrelated working-tree changes and stage only task-owned paths.

---

### Task 1: Create the typed advisor domain and hard-coded category rules

**Files:**

- Create: src/features/product-advisor/types.ts
- Create: src/features/product-advisor/category-definitions.ts
- Create: src/features/product-advisor/normalizers.ts
- Create: src/features/product-advisor/recommendations.ts
- Test: src/features/product-advisor/recommendations.test.ts
- Test: src/features/product-advisor/normalizers.test.ts

**Interfaces:**

- Produces AdvisorCategoryDefinition, AdvisorQuestion, AdvisorProductSnapshot, AdvisorRecommendation, normalizeAdvisorSpecs, and recommendProducts.
- Consumes only serializable snapshots. It must not import Prisma, React, browser APIs, or route modules.

- [ ] **Step 1: Write failing recommendation tests**

```ts
it("keeps a product with a missing verified night-detail field as unknown", () => {
  const result = recommendProducts(reolinkDefinition, products, [
    { questionId: "night-detail", value: "high" },
  ]);

  expect(result.candidates[0].unknown).toContain("night-detail");
  expect(result.candidates[0].matched).not.toContain("night-detail");
});

it("returns a narrowed result instead of ranking a category with insufficient evidence", () => {
  expect(recommendProducts(definition, sparseProducts, answers).mode).toBe("narrowed");
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: pnpm vitest run src/features/product-advisor/recommendations.test.ts src/features/product-advisor/normalizers.test.ts --pool=forks --maxWorkers=1

Expected: FAIL because the modules do not exist.

- [ ] **Step 3: Define serializable contracts**

```ts
export interface AdvisorQuestion {
  id: string;
  label: string;
  help?: string;
  type: "single" | "multiple";
  options: readonly { id: string; label: string; helper?: string }[];
}

export interface AdvisorCategoryDefinition {
  slug: string;
  label: string;
  intentIds: readonly string[];
  questions: readonly AdvisorQuestion[];
  normalizers: readonly AdvisorSpecNormalizer[];
  rules: readonly AdvisorRule[];
}
```

Implement the hard-coded trees for Reolink, industrial cameras, Blackmagic, X-ray, HPC, conference, imaging, and other categories. Every question includes unknown and every rule declares its source labels.

- [ ] **Step 4: Implement label normalization and explainable evaluation**

```ts
export function recommendProducts(
  definition: AdvisorCategoryDefinition,
  products: readonly AdvisorProductSnapshot[],
  answers: readonly AdvisorAnswer[]
): AdvisorRecommendationSet;
```

Return a maximum of four candidates plus matched, tradeoffs, unknown, and sourceLabels evidence. Missing normalized fields are always unknown and do not increase a score.

- [ ] **Step 5: Run focused quality checks**

Run: pnpm vitest run src/features/product-advisor/recommendations.test.ts src/features/product-advisor/normalizers.test.ts --pool=forks --maxWorkers=1

Run: pnpm exec eslint src/features/product-advisor --max-warnings=0

Expected: PASS.

- [ ] **Step 6: Commit the domain layer**

```powershell
git add src/features/product-advisor
git commit -m "feat(advisor): add deterministic selection rules"
```

### Task 2: Add the category-scoped, cached server data adapter

**Files:**

- Create: src/lib/data/productAdvisor.ts
- Create: src/lib/data/productAdvisor.test.ts
- Modify: src/lib/data/tags.ts

**Interfaces:**

- Consumes Task 1 snapshot and normalizer contracts.
- Produces getAdvisorCategory(slug): Promise<AdvisorCategoryData | null>.
- Uses Prisma only on the server and returns no raw database model to a client component.

- [ ] **Step 1: Write a failing adapter test**

```ts
it("queries only available products in the requested category and maps verified specs", async () => {
  vi.mocked(prisma.category.findFirst).mockResolvedValue(categoryFixture);
  vi.mocked(prisma.product.findMany).mockResolvedValue(productFixtures);
  vi.mocked(prisma.productSpecs.findMany).mockResolvedValue(specFixtures);

  await expect(getAdvisorCategory("reolink-cctv-camera")).resolves.toMatchObject({
    category: { slug: "reolink-cctv-camera" },
    products: [{ productId: 12, specs: expect.any(Array) }],
  });
});
```

- [ ] **Step 2: Run the adapter test to verify it fails**

Run: pnpm vitest run src/lib/data/productAdvisor.test.ts --pool=forks --maxWorkers=1

Expected: FAIL because the adapter does not exist.

- [ ] **Step 3: Implement one-category loading and cache tags**

```ts
export async function getAdvisorCategory(slug: string): Promise<AdvisorCategoryData | null> {
  "use cache";
  cacheTag(TAGS.products);
  cacheTag(TAGS.categories);
  cacheLife("minutes");
  // Query the selected category and its available product/spec rows only.
}
```

Use existing category/subcategory link logic for detail URLs. Preserve each normalized value's source label and omit unverifiable values.

- [ ] **Step 4: Run focused checks**

Run: pnpm vitest run src/lib/data/productAdvisor.test.ts --pool=forks --maxWorkers=1

Run: pnpm exec eslint src/lib/data/productAdvisor.ts src/lib/data/productAdvisor.test.ts --max-warnings=0

Run: pnpm exec prettier --check src/lib/data/productAdvisor.ts src/lib/data/productAdvisor.test.ts

Expected: PASS.

- [ ] **Step 5: Commit the adapter**

```powershell
git add src/lib/data/productAdvisor.ts src/lib/data/productAdvisor.test.ts src/lib/data/tags.ts
git commit -m "feat(advisor): load verified category data"
```

### Task 3: Build anonymous project state and the comparison board

**Files:**

- Create: src/features/product-advisor/project-state.ts
- Create: src/features/product-advisor/project-state.test.ts
- Create: src/features/product-advisor/AdvisorProjectProvider.tsx
- Create: src/features/product-advisor/AdvisorBoard.tsx
- Create: src/features/product-advisor/AdvisorBoard.test.tsx
- Create: src/app/(main)/product-finder/board/page.tsx

**Interfaces:**

- Consumes Task 1 snapshots and answer types.
- Produces useAdvisorProject() with saveAnswers, addToBoard, removeFromBoard, setPreferred, setQuantity, and setNote.
- Board accepts snapshots from the finder and later product dossiers with no network request.

- [ ] **Step 1: Write failing reducer/persistence tests**

```ts
it("groups cross-category products but compares only the chosen category", () => {
  const state = reduceProject(emptyProject, addToBoard(reolinkCamera));
  const next = reduceProject(state, addToBoard(blackmagicCamera));

  expect(selectComparableItems(next, "reolink-cctv-camera")).toEqual([reolinkCamera]);
  expect(selectBoardGroups(next)).toHaveLength(2);
});
```

- [ ] **Step 2: Run reducer tests to verify they fail**

Run: pnpm vitest run src/features/product-advisor/project-state.test.ts --pool=forks --maxWorkers=1

Expected: FAIL because project state does not exist.

- [ ] **Step 3: Implement versioned local project state**

```ts
export const ADVISOR_STORAGE_KEY = "farabak-product-advisor:v1";

export function hydrateProject(value: string | null): AdvisorProject {
  // Parse safely, validate version, otherwise return EMPTY_ADVISOR_PROJECT.
}
```

Persist after client hydration only. Limit category comparison to four products. Notes stay local.

- [ ] **Step 4: Implement the board**

Use labelled groups, only-differences/all-facts toggle, explicit ثبت نشده cells, labelled quantity fields, preferred-choice radios, and a report link. Render card alternatives on narrow screens instead of page-width overflow.

- [ ] **Step 5: Run focused state/component tests**

Run: pnpm vitest run src/features/product-advisor/project-state.test.ts src/features/product-advisor/AdvisorBoard.test.tsx --pool=forks --maxWorkers=1

Expected: PASS, including reload restoration and keyboard actions.

- [ ] **Step 6: Commit state and board**

```powershell
git add src/features/product-advisor src/app/(main)/product-finder/board
git commit -m "feat(advisor): add anonymous decision board"
```

### Task 4: Implement the animated finder and entry route

**Files:**

- Create: src/app/(main)/product-finder/page.tsx
- Create: src/app/(main)/product-finder/loading.tsx
- Create: src/app/(main)/product-finder/error.tsx
- Create: src/app/(main)/product-finder/FinderWorkspace.tsx
- Create: src/app/(main)/product-finder/FinderEntry.tsx
- Create: src/app/(main)/product-finder/FinderQuestion.tsx
- Create: src/app/(main)/product-finder/FinderResults.tsx
- Test: src/app/(main)/product-finder/FinderWorkspace.test.tsx
- Test: src/app/(main)/product-finder/page.test.tsx

**Interfaces:**

- Consumes Tasks 1–3.
- Produces /product-finder and actions that add serialized products to the board.

- [ ] **Step 1: Write failing interaction tests**

```tsx
it("does not request data again while a visitor answers", async () => {
  render(<FinderWorkspace category={fixture} />);
  await user.click(screen.getByRole("radio", { name: "فضای باز" }));
  await user.click(screen.getByRole("button", { name: "ادامه" }));

  expect(global.fetch).not.toHaveBeenCalled();
  expect(screen.getByRole("heading", { name: "اولویت کیفیت تصویر" })).toBeVisible();
});
```

- [ ] **Step 2: Run finder tests to verify they fail**

Run: pnpm vitest run src/app/(main)/product-finder --pool=forks --maxWorkers=1

Expected: FAIL because the route/workspace does not exist.

- [ ] **Step 3: Implement the server route and static entry**

Without category, render hard-coded intent tiles and direct-category links. With category, call exactly one getAdvisorCategory and pass serialized data into FinderWorkspace. Add metadata and clear not-found/error states.

- [ ] **Step 4: Implement progressive motion**

```tsx
<AnimatePresence mode="wait" initial={false}>
  <motion.section
    key={question.id}
    initial={reducedMotion ? false : { opacity: 0, x: 8 }}
    animate={{ opacity: 1, x: 0 }}
    exit={reducedMotion ? undefined : { opacity: 0, x: -8 }}
    transition={{ duration: reducedMotion ? 0 : 0.2 }}
  >
    <FinderQuestion question={question} />
  </motion.section>
</AnimatePresence>
```

Use a semantic progress element, accumulated answer chips, focus transfer to the new heading, and a polite candidate-count live region. Answer handlers update local state only.

- [ ] **Step 5: Implement result evidence and board actions**

Render matched facts, trade-offs, unknowns, dossier links, and add-to-board. In narrowed/zero-match mode preserve editable answers and link to the existing category listing.

- [ ] **Step 6: Run source quality checks**

Run: pnpm vitest run src/app/(main)/product-finder --pool=forks --maxWorkers=1

Run: pnpm exec eslint src/app/(main)/product-finder src/features/product-advisor --max-warnings=0

Run: pnpm exec prettier --check "src/app/(main)/product-finder/**/\*.{ts,tsx}" "src/features/product-advisor/**/*.{ts,tsx}"

Expected: PASS.

- [ ] **Step 7: Commit the finder**

```powershell
git add src/app/(main)/product-finder src/features/product-advisor
git commit -m "feat(advisor): add guided product finder"
```

### Task 5: Add the report and lazy PDF export

**Files:**

- Create: src/features/product-advisor/SelectionReport.tsx
- Create: src/features/product-advisor/exportSelectionReport.ts
- Create: src/features/product-advisor/exportSelectionReport.test.ts
- Create: src/app/(main)/product-finder/report/page.tsx
- Create: src/app/(main)/product-finder/report/ReportWorkspace.tsx
- Test: src/app/(main)/product-finder/report/ReportWorkspace.test.tsx

**Interfaces:**

- Consumes Task 3 project state.
- Produces exportSelectionReport(element, filename): Promise<void> plus accessible HTML report.

- [ ] **Step 1: Write failing export tests**

```ts
it("loads PDF dependencies only after export and slices a tall report into A4 pages", async () => {
  await exportSelectionReport(reportElement, "گزارش-انتخاب-فرابک.pdf");

  expect(html2canvas).toHaveBeenCalledWith(reportElement, expect.objectContaining({ scale: 2 }));
  expect(mockPdf.addPage).toHaveBeenCalledTimes(1);
  expect(mockPdf.save).toHaveBeenCalledWith("گزارش-انتخاب-فرابک.pdf");
});
```

- [ ] **Step 2: Run export tests to verify they fail**

Run: pnpm vitest run src/features/product-advisor/exportSelectionReport.test.ts src/app/(main)/product-finder/report --pool=forks --maxWorkers=1

Expected: FAIL because report/export modules do not exist.

- [ ] **Step 3: Implement accessible report composition**

Include goal, answers, selected products, quantities, preferred choice, note, evidence, unknowns, and an explicit non-quotation notice. Empty state links back to finder/board.

- [ ] **Step 4: Implement lazy multi-page export and print fallback**

```ts
const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
  import("html2canvas"),
  import("jspdf"),
]);
```

Use scale 2, preserve canvas ratio across page slices, disable export while running, surface inline errors, name the file گزارش-انتخاب-فرابک.pdf, and expose existing usePrint as fallback.

- [ ] **Step 5: Verify no eager PDF imports**

Run: pnpm vitest run src/features/product-advisor/exportSelectionReport.test.ts src/app/(main)/product-finder/report --pool=forks --maxWorkers=1

Run: rg -n 'from "(html2canvas|jspdf)"' "src/app/(main)/product-finder" src/features/product-advisor

Expected: tests PASS; the search has no static imports.

- [ ] **Step 6: Commit report export**

```powershell
git add src/features/product-advisor src/app/(main)/product-finder/report
git commit -m "feat(advisor): export selection reports"
```

### Task 6: Connect entry points and prove visual/performance behavior

**Files:**

- Modify: src/app/(main)/products/_components/ProductResultsBar.tsx
- Modify: the current post-redesign product dossier action component after ownership inspection
- Create: docs/superpowers/reports/2026-10-28-product-advisor-qa.md

**Interfaces:**

- Consumes finder, board, and report routes from Tasks 3–5.
- Produces one catalogue finder entry and one verified-snapshot board action from the product dossier.

- [ ] **Step 1: Write a failing catalogue entry test**

```tsx
it("offers the finder from the catalogue toolbar", () => {
  render(<ProductResultsBar resultCount={4} totalCount={310} currentPage={1} />);

  expect(screen.getByRole("link", { name: "راهنمای انتخاب محصول" })).toHaveAttribute(
    "href",
    "/product-finder"
  );
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: pnpm vitest run src/app/(main)/products/_components/ProductResultsBar.test.tsx --pool=forks --maxWorkers=1

Expected: FAIL because the entry link does not exist.

- [ ] **Step 3: Add entry points without changing catalogue contracts**

Add the finder action to the results toolbar. Inspect the final dossier component ownership before adding a board action. It must pass only verified current route data into AdvisorProductSnapshot and make no request.

- [ ] **Step 4: Run validation**

Run: pnpm vitest run src/features/product-advisor src/app/(main)/product-finder src/app/(main)/products/_components/ProductResultsBar.test.tsx --pool=forks --maxWorkers=1

Run: pnpm lint:ci

Run: pnpm format:check

Run: pnpm build

Run: git diff --check

Expected: PASS, or record unrelated failures separately.

- [ ] **Step 5: Browser/performance QA**

At 320, 390, 768, 1024, and 1440px verify intent selection, a real Reolink/Blackmagic flow, keyboard-only completion, unknown and zero-match paths, board add/remove/quantity/preferred/note, restore after reload, PDF download and print legibility, reduced motion, and no horizontal overflow. Network evidence must show zero answer-step fetches and only a selected-category data load. Record it in the QA report.

- [ ] **Step 6: Commit integration and QA**

```powershell
git add src/app/(main)/products/_components/ProductResultsBar.tsx src/app/(main)/products/[category]/[subcategory]/[product] docs/superpowers/reports/2026-10-28-product-advisor-qa.md
git commit -m "feat(advisor): connect product selection tools"
```

## Plan self-review

- The plan covers the intent mapper, hard-coded category questions, explainable deterministic matching, local board, PDF report, motion, efficiency, and future handoff seam.
- It deliberately excludes contact capture and Telegram delivery.
- Task 2 constrains server loading to one category, Task 4 verifies no answer-step request, and Task 5 isolates PDF libraries behind dynamic imports.
- Missing product data remains unknown across Tasks 1–5.
- All types used by routes and features are introduced in Task 1.
