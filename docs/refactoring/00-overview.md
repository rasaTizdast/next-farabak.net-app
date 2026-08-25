# Refactoring Master Plan — next-farabak-app-v15

> **Date:** 2026-07-26
> **Scope:** Full stack (admin + public + API + design system)
> **Approach:** Phased, each phase is a standalone plan file
> **Total Estimated Effort:** ~31-44 hours across 7 phases

---

## Why This Refactoring?

The project was built years ago and went through a poor refactoring cycle. Key symptoms:

- **38 components over 300 lines** (largest: 2,275 lines)
- **3 competing styling systems** (Ant Design, Tailwind, styled JSX) with 500+ lines of `!important` CSS overrides
- **11 files with insecure JWT fallback** (`"your_jwt_secret"`)
- **9 API routes creating separate PrismaClient** instances (memory leak risk)
- **2,623 lines of duplicated TipTap editor code** across 3 near-identical copies
- **20 out of 45 admin API routes have ZERO authentication** — the entire warehouses subtree is unprotected
- **Zero API routes use schema validation** (Yup or Zod) — only manual `if (!field)` checks or nothing
- **4 different error response formats** (`{error}`, `{message}`, `{success}`, `{faqs}`) across routes
- **Duplicated validation, error handling, and utility functions** scattered across helpers
- **`noImplicitAny: false`** despite `strict: true` in tsconfig
- **139 existing test files** but React Doctor has all 21 rules disabled

---

## Phase Summary

| Phase | File                                                         | What It Fixes                                                    | Effort      | Risk   |
| ----- | ------------------------------------------------------------ | ---------------------------------------------------------------- | ----------- | ------ |
| **0** | [01-security-fixes.md](01-security-fixes.md)                 | JWT fallbacks, missing auth (20 routes!), extract verifyToken    | ~3-4 hours  | Low    |
| **1** | [02-foundation.md](02-foundation.md)                         | Shared types, utilities, auth module, error responses            | ~3-4 hours  | Low    |
| **2** | [03-design-system.md](03-design-system.md)                   | Ant Design ConfigProvider, Tailwind tokens, remove CSS overrides | ~4-6 hours  | Medium |
| **3** | [04-api-routes.md](04-api-routes.md)                         | Zod validation, error format, consistency                        | ~4-5 hours  | Low    |
| **4** | [05-component-architecture.md](05-component-architecture.md) | Split giant components, deduplicate editors/blogs/accordions     | ~8-12 hours | High   |
| **5** | [06-ui-consistency.md](06-ui-consistency.md)                 | Unified buttons/tables, inline styles, RTL, error pages          | ~5-7 hours  | Medium |
| **6** | [07-code-quality.md](07-code-quality.md)                     | Enable noImplicitAny, clean any types, improve tests             | ~4-6 hours  | Medium |

---

## Execution Order

**Phases 0 → 1 → 2 → 3 → 4 → 5 → 6** — strict order. Each phase depends on the one before it.

- **Phase 0** must be first (security)
- **Phase 1** must come before 3-6 (shared types/utils are used everywhere)
- **Phase 2** should come before 4-5 (design system changes affect component code)
- **Phases 3, 4, 5** can be interleaved if needed, but sequential is safer
- **Phase 6** is last (quality gates)

---

## How to Use These Plans

Each file is **self-contained**. You can hand any single file to an agent and it will have enough context to execute that phase independently.

**Before starting a phase:**

1. Read the full plan file
2. Run the "Verification Checklist" at the end to confirm preconditions
3. Execute the changes
4. Run `npm run build` to verify no regressions
5. Run `npm test` if tests exist for touched files

---

## Key Files Referenced Across Phases

| File                  | Phases  | Why                                 |
| --------------------- | ------- | ----------------------------------- |
| `src/lib/prisma.ts`   | 0, 1, 3 | JWT extraction, console.log cleanup |
| `src/app/globals.css` | 2, 5    | Design tokens, CSS cleanup          |
| `tailwind.config.ts`  | 2, 5    | Color tokens, breakpoints           |
| `src/app/layout.tsx`  | 2       | Ant Design ConfigProvider           |
| `tsconfig.json`       | 6       | noImplicitAny                       |
| `doctor.config.mjs`   | 6       | React Doctor suppressions           |
