"use client";

import React, { useState, useMemo } from "react";
import { usePowerManagementData } from "./hooks/usePMHook";
import { PowerDataItem } from "./types";
import ChartComponent from "./components/ChartComponent";
import InputForm from "./components/InputForm";
import TableComponent from "./components/TableComponent";

// --- Helper Components ---

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Error Message Component
const ErrorDisplay = ({ error }: { error: { message?: string } | null }) => (
  <div
    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-8 rounded-lg relative"
    role="alert"
  >
    <strong className="font-bold">Error:</strong>
    <span className="block sm:inline ml-2">
      {error?.message || "An unknown error occurred."}
    </span>
  </div>
);

// --- Main Dashboard Component ---

export default function PowerManagementDashboard() {
  // --- State and Hook Initialization ---
  const [ownerId, setOwnerId] = useState(""); // Default value
  const [startDate, setStartDate] = useState("2021-01-01");
  const [endDate, setEndDate] = useState("");
  const [granularity, setGranularity] = useState<"live" | "day" | "month">(
    "live"
  );

  // Replace with your actual FastAPI endpoint URL
  const FASTAPI_ENDPOINT = "http://10.60.75.142:8181/PM_search_report";
  const { data, isLoading, error, fetchData } =
    usePowerManagementData(FASTAPI_ENDPOINT);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!ownerId) {
      alert("Owner ID is required.");
      return;
    }
    fetchData(ownerId, startDate, endDate);
  };

  // --- Memoized Data for Chart ---
  // Recharts expects data to be consistent. Memoizing prevents recalculation on every render.
  // --- Memoized and Aggregated Data for Chart ---
  const chartData = useMemo(() => {
    if (!data) return [];

    const parseTimestamp = (timestamp: string) => {
      // Correctly parses DD/MM/YYYY format
      const [day, month, yearTime] = timestamp.split("/");
      const [year, time] = yearTime.split(" ");
      return new Date(`${year}-${month}-${day}T${time}`);
    };

    if (granularity === "live") {
      return [...data].map((item) => ({
        ...item,
        timestamp: parseTimestamp(
          item.Current_Phase_A_TIMESTAMP
        ).toLocaleTimeString(),
      }));
    }

    const aggregationMap = new Map<string, PowerDataItem[]>();

    data.forEach((item) => {
      const date = parseTimestamp(item.Current_Phase_A_TIMESTAMP);
      let key = "";

      if (granularity === "day") {
        key = date.toLocaleDateString("en-CA"); // YYYY-MM-DD
      } else if (granularity === "month") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`; // YYYY-MM
      }

      if (!aggregationMap.has(key)) {
        aggregationMap.set(key, []);
      }
      aggregationMap.get(key)!.push(item);
    });

    return Array.from(aggregationMap.entries())
      .map(([key, values]) => {
        const avg = (arr: number[]) =>
          arr.reduce((a, b) => a + b, 0) / arr.length;

        const currentAValues = values.map((v) => v.Current_Phase_A_VALUE);
        const currentBValues = values.map((v) => v.Current_Phase_B_VALUE);
        const currentCValues = values.map((v) => v.Current_Phase_C_VALUE);
        const realPowerValues = values.map((v) => v.Real_Power_Total_VALUE);

        return {
          timestamp: key,
          Current_Phase_A_VALUE: avg(currentAValues),
          Current_Phase_B_VALUE: avg(currentBValues),
          Current_Phase_C_VALUE: avg(currentCValues),
          Real_Power_Total_VALUE: avg(realPowerValues),
        };
      })
      .sort(
        (b, a) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
  }, [data, granularity]);

  // --- Render ---
  return (
    <div className="min-h-screen">
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Power Monitoring Dashboard
          </h1>
        </header>

        {/* --- Input Form --- */}
        <InputForm
          ownerId={ownerId}
          setOwnerId={setOwnerId}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          isLoading={isLoading}
          handleSubmit={handleSubmit}
        />

        {/* --- Data Display Area --- */}
        {isLoading && <LoadingSpinner />}
        {error && (
          <ErrorDisplay
            error={typeof error === "string" ? { message: error } : error}
          />
        )}

        {data && !isLoading && (
          <>
            {data.length > 0 ? (
              // 👇 Use flex-row on large screens for a side-by-side layout
              <div className="flex flex-col lg:flex-row lg:gap-8">
                {/* --- Chart Column (Left Side) --- */}
                {/* 👇 Allocate more width to the chart on large screens */}
                <div className="w-full lg:w-2/3 mb-8 lg:mb-0">
                  {/* 👇 1. Control Chart Height with Aspect Ratio
                - `aspect-video` sets a 16:9 aspect ratio.
                - `max-h-[600px]` provides an upper limit on height.
              */}
                  <div className="aspect-video max-h-[600px]">
                    <ChartComponent
                      chartData={chartData}
                      granularity={granularity}
                      setGranularity={setGranularity}
                    />
                  </div>
                </div>

                {/* --- Table Column (Right Side) --- */}
                {/* 👇 Allocate remaining width to the table */}
                <div className="w-full lg:w-1/3 flex flex-col">
                  {/*
                👇 2. Enforce Max Height and Scrolling on Table
                - `max-h-[600px]` caps the container's height (matches chart).
                - `overflow-y-auto` adds a vertical scrollbar only when needed.
                - `flex-grow` allows the container to fill the parent flex column.
              */}
                  <div className="flex-grow overflow-y-auto max-h-[600px]">
                    <TableComponent data={data} />
                  </div>
                </div>
              </div>
            ) : (
              // --- Placeholder for when data is empty ---
              <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-center min-h-[500px]">
                <p className="text-gray-500 text-lg font-medium">
                  📊 No data available to display.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
