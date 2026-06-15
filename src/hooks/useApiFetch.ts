"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

type UseApiFetchResult<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useApiFetch<T = any>(
  url: string | null,
  fetchOnMount: boolean = true
): UseApiFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(url);
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
  }, [url]);

  useEffect(() => {
    if (fetchOnMount) fetchData();
  }, [fetchData, fetchOnMount]);

  return { data, loading, error, refetch: fetchData };
}
