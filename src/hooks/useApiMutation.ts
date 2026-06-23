"use client";
import axios from "axios";
import { useState, useCallback } from "react";

type MutationMethod = "post" | "put" | "patch" | "delete";

async function executeMutation<TResponse, TData>(
  method: MutationMethod,
  url: string,
  data: TData | undefined,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): Promise<TResponse | null> {
  setLoading(true);
  setError(null);
  try {
    const response =
      method === "delete" ? await axios[method](url, { data }) : await axios[method](url, data);
    if (response.status >= 400) {
      const msg = "خطا در عملیات";
      setError(msg);
      return null;
    }
    return response.data as TResponse;
  } catch (e: any) {
    const message = e?.response?.data?.message || e?.message || "خطا در عملیات";
    setError(message);
    return null;
  } finally {
    setLoading(false);
  }
}

type UseApiMutationResult<TData, TResponse> = {
  mutate: TData extends undefined
    ? (url: string) => Promise<TResponse | null>
    : (url: string, data?: TData) => Promise<TResponse | null>;
  loading: boolean;
  error: string | null;
  reset: () => void;
};

export function useApiMutation<TResponse = any, TData = any>(
  method: MutationMethod = "post"
): UseApiMutationResult<TData, TResponse> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  const mutate = useCallback(
    async (url: string, data?: TData): Promise<TResponse | null> => {
      return executeMutation<TResponse, TData>(method, url, data, setLoading, setError);
    },
    [method]
  );

  return { mutate: mutate as any, loading, error, reset };
}
