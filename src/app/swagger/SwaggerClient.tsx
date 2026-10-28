"use client";

import { useEffect, useState } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

import LoadingSpinner from "../_components/ui/LoadingSpinner";

interface SwaggerSpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  paths: Record<string, unknown>;
}

async function fetchSwaggerSpec(
  setSpec: React.Dispatch<React.SetStateAction<SwaggerSpec | null>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) {
  try {
    setError(null);
    const response = await fetch("/api/swagger");
    if (!response.ok) {
      throw new Error("Failed to fetch Swagger spec");
    }
    const data = await response.json();
    setSpec(data);
  } catch (error) {
    console.error("Error fetching Swagger spec:", error);
    setError("دریافت مستندات API با خطا روبه‌رو شد.");
  }
}

export default function SwaggerClient() {
  const [spec, setSpec] = useState<SwaggerSpec | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSwaggerSpec(setSpec, setError);
  }, []);

  if (error) {
    return (
      <main className="mx-auto max-w-3xl p-6" aria-labelledby="swagger-error-title">
        <div
          role="alert"
          className="rounded-lg border border-red-700 bg-red-950/40 p-6 text-red-100"
        >
          <h1 id="swagger-error-title" className="text-lg font-semibold">
            خطا در بارگذاری مستندات
          </h1>
          <p className="mt-2">{error}</p>
          <button
            type="button"
            onClick={() => void fetchSwaggerSpec(setSpec, setError)}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none motion-reduce:transition-none"
          >
            تلاش دوباره
          </button>
        </div>
      </main>
    );
  }

  if (!spec) {
    return (
      <div className="mt-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <main className="min-w-0 overflow-x-auto" aria-labelledby="swagger-title">
      <h1 id="swagger-title" className="sr-only">
        مستندات API
      </h1>
      <SwaggerUI spec={spec} />
    </main>
  );
}
