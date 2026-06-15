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

export default function SwaggerClient() {
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
        throw new Error("Error fetching Swagger spec:", error!);
      }
    };

    fetchSwaggerSpec();
  }, []);

  if (!spec) {
    return (
      <div className="mt-12">
        <LoadingSpinner />
      </div>
    );
  }

  return <SwaggerUI spec={spec} />;
}
