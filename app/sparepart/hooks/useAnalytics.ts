// hooks/useAnalytics.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AnalyticsOverviewResponse,
  ValueSummaryResponse,
} from "../types/analytics";

// Define a return type for our hook for better autocompletion
interface UseAnalyticsReturn {
  overviewData: AnalyticsOverviewResponse | null;
  valueData: ValueSummaryResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAnalytics(): UseAnalyticsReturn {
  const [overviewData, setOverviewData] =
    useState<AnalyticsOverviewResponse | null>(null);
  const [valueData, setValueData] = useState<ValueSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // It's best practice to use an environment variable for your API base URL
    const API_BASE_URL = `http://10.60.75.142:8181`;

    try {
      // Fetch both endpoints concurrently for better performance
      const [overviewRes, valueRes] = await Promise.all([
        fetch(`${API_BASE_URL}/sparepart/analytics/overview`),
        fetch(`${API_BASE_URL}/sparepart/analytics/value-summary`),
      ]);

      if (!overviewRes.ok || !valueRes.ok) {
        // Handle potential HTTP errors from either request
        throw new Error(
          "Failed to fetch analytics data. Please check the API server."
        );
      }

      const overviewJson: AnalyticsOverviewResponse = await overviewRes.json();
      const valueJson: ValueSummaryResponse = await valueRes.json();

      setOverviewData(overviewJson);
      setValueData(valueJson);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Analytics fetch error:", err);
        setError(err.message || "An unknown error occurred.");
      } else {
        console.error("Analytics fetch error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]); // fetchAnalyticsData is wrapped in useCallback, so this only runs once

  // Expose a refetch function so the component can trigger a refresh if needed
  const refetch = () => {
    fetchAnalyticsData();
  };

  return { overviewData, valueData, isLoading, error, refetch };
}
