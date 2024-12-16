"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { useEffect, useState } from "react";
import LoadingSpinner from "../_components/ui/LoadingSpinner";
import { notFound } from "next/navigation";

interface SwaggerSpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  paths: Record<string, unknown>; // Change this to unknown for more flexibility
}

export default function SwaggerPage() {
  const [spec, setSpec] = useState<SwaggerSpec | null>(null);

  useEffect(() => {
    const fetchSwaggerSpec = async () => {
      try {
        const response = await fetch("/api/swagger");
        if (!response.ok) {
          throw new Error("Failed to fetch Swagger spec");
        }
        const data = await response.json();
        setSpec(data);
      } catch (error) {
        console.error("Error fetching Swagger spec:", error);
      }
    };

    fetchSwaggerSpec();
  }, []);

  // Prevent SwaggerUI from rendering in production
  if (process.env.NODE_ENV === "production") {
    return notFound(); // or a placeholder component
  }

  if (!spec) {
    return (
      <div className="mt-12">
        <LoadingSpinner />
      </div>
    );
  }

  return <SwaggerUI spec={spec} />;
}
