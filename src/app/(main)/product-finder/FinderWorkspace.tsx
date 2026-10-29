"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useState } from "react";

import { advisorCategoryDefinitions } from "@/features/product-advisor/category-definitions";
import { recommendProducts } from "@/features/product-advisor/recommendations";
import type { AdvisorAnswer, AdvisorProductSnapshot } from "@/features/product-advisor/types";

interface FinderWorkspaceProps {
  category: { name: string; slug: string };
  products: AdvisorProductSnapshot[];
}

export default function FinderWorkspace({ category, products }: FinderWorkspaceProps) {
  const definition = advisorCategoryDefinitions[category.slug];
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AdvisorAnswer[]>([]);
  if (!definition) return null;
  const question = definition.questions[step];
  const result = recommendProducts(definition, products, answers);

  function choose(value: string) {
    setAnswers((current) => [
      ...current.filter((answer) => answer.questionId !== question.id),
      { questionId: question.id, value },
    ]);
    setStep((current) => Math.min(current + 1, definition.questions.length));
  }

  if (!question) {
    function saveReport() {
      localStorage.setItem(
        "farabak-product-advisor:report:v1",
        JSON.stringify({
          category,
          answers,
          candidates: result.candidates,
          createdAt: new Date().toISOString(),
        })
      );
    }
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-10">
        <p className="text-sm text-slate-600">
          {result.mode === "ranked"
            ? "نتایج با مشخصات ثبت‌شده تطبیق داده شدند."
            : "مشخصات ثبت‌شده برای رتبه‌بندی قطعی کافی نیستند؛ فهرست محدودشده را بررسی کنید."}
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {result.candidates.map(({ product, matched, unknown }) => (
            <article key={product.productId} className="rounded-2xl border border-slate-200 p-5">
              <h2 className="font-bold text-slate-950">{product.name}</h2>
              <p className="mt-2 text-sm text-slate-600">
                {matched.join("، ") || "تطبیق قطعی ثبت نشده"}
              </p>
              {unknown.length ? (
                <p className="mt-2 text-sm text-amber-700">{unknown.join("، ")}</p>
              ) : null}
              <Link
                className="mt-4 inline-flex font-semibold text-blue-700"
                href={product.detailHref}
              >
                مشاهده محصول
              </Link>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            onClick={saveReport}
            className="rounded-xl bg-blue-700 px-4 py-2 font-bold text-white"
            href="/product-finder/report"
          >
            دریافت گزارش انتخاب
          </Link>
          <Link
            onClick={saveReport}
            className="rounded-xl border px-4 py-2 font-bold"
            href="/product-finder/board"
          >
            باز کردن میز تصمیم
          </Link>
          <button
            className="rounded-xl border px-4 py-2"
            type="button"
            onClick={() => {
              setAnswers([]);
              setStep(0);
            }}
          >
            شروع دوباره
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-10" aria-live="polite">
      <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className="h-full bg-blue-700"
          animate={{ width: `${((step + 1) / definition.questions.length) * 100}%` }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
        />
      </div>
      <p className="text-sm text-slate-500">
        {category.name} · گام {step + 1} از {definition.questions.length}
      </p>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={question.id}
          initial={reducedMotion ? false : { opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, x: -8 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
        >
          <h1 className="mt-4 text-2xl font-black text-slate-950">{question.label}</h1>
          {question.help ? <p className="mt-2 text-slate-600">{question.help}</p> : null}
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {question.options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => choose(option.id)}
                className="rounded-2xl border border-slate-200 p-4 text-right font-semibold transition hover:border-blue-600 focus-visible:outline-2 focus-visible:outline-blue-700"
              >
                {option.label}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
