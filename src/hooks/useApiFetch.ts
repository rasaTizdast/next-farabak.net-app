"use client";
import axios, { type AxiosRequestConfig } from "axios";
import { useState, useEffect, useCallback } from "react";

type UseApiFetchResult<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

async function executeApiFetch<T>(
  url: string | null,
  config: AxiosRequestConfig | undefined,
  setData: React.Dispatch<React.SetStateAction<T | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) {
  if (!url) return;
  setLoading(true);
  setError(null);
  try {
    const response = await axios.get(url, config);
    if (response.status >= 400) {
      setError("خطا در دریافت اطلاعات");
      setData(null);
      return;
    }
    setData(response.data);
  } catch (e: any) {
    const message = e?.response?.data?.message || e?.message || "خطا در دریافت اطلاعات";
    setError(message);
    setData(null);
  } finally {
    setLoading(false);
  }
}

export function useApiFetch<T = any>(
  url: string | null,
  fetchOnMount: boolean = true,
  config?: AxiosRequestConfig
): UseApiFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    await executeApiFetch<T>(url, config, setData, setLoading, setError);
  }, [url]);

  // eslint-disable-next-line react-compiler/set-state-in-effect
  useEffect(() => {
    if (fetchOnMount) fetchData();
  }, [fetchData, fetchOnMount]);

  return { data, loading, error, refetch: fetchData };
}
