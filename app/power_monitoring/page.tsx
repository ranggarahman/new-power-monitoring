"use client";

import React, { useState, useMemo, useEffect } from "react";
import { usePowerManagementData } from "../hooks/usePMHook";
import { PowerDataItem } from "../types";
import ChartComponent from "../components/ChartComponent";
import InputForm from "../components/InputForm";
import TableComponent from "../components/TableComponent";
import { Granularity } from "../components/DrillControls";
import { ChartDisplayMode } from "../components/ChartModeControls";

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
export default function PowerMonitoringDashboard() {
  // --- State and Hook Initialization ---
  const [ownerId, setOwnerId] = useState("");
  const [startDate, setStartDate] = useState("2021-01-01");
  const [endDate, setEndDate] = useState("");

  // 💡 Update granularity state with the new default 'today'
  const [granularity, setGranularity] = useState<Granularity>("today");
  const [chartMode, setChartMode] = useState<ChartDisplayMode>("power");
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");

  const FASTAPI_ENDPOINT = "http://10.60.75.142:8181/pm/PM_search_report";
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

  // 💡 Effect to fetch data automatically for the "Today" view
 useEffect(() => {
    // Don't fetch if there's no ownerId
    if (!ownerId) return;

    // If the view is 'today', fetch only the current day's data
    if (granularity === "today") {
      const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
      fetchData(ownerId, todayStr, todayStr);
    } 
    // If view is daily, weekly, or monthly, fetch using the main date pickers
    else {
      fetchData(ownerId, startDate, endDate);
    }
  }, [granularity, ownerId, startDate, endDate, fetchData]);

  // 💡 A completely rewritten, cleaner, and more powerful useMemo hook
  const chartData = useMemo(() => {
    if (!data) return [];

    const parseTimestamp = (timestamp: string) => {
      const [day, month, yearTime] = timestamp.split("/");
      const [year, time] = yearTime.split(" ");
      return new Date(`${year}-${month}-${day}T${time}`);
    };

    // Helper function to get the start of the week (Sunday) for grouping
    const getStartOfWeek = (date: Date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day;
      return new Date(d.setDate(diff)).toLocaleDateString("en-CA"); // YYYY-MM-DD
    };

    // --- Granularity Logic ---

    if (granularity === "today") {
      // For "Today", we filter by time but do not aggregate
      const now = new Date();
      const currentTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      
      const timeFilteredData = data.filter((item) => {
        const itemTimestamp = parseTimestamp(item.Current_Phase_A_TIMESTAMP);
        const itemTime = itemTimestamp.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
        // Ensure we don't show future times and respect the user's time range filter
        return itemTime >= startTime && itemTime <= endTime && itemTime <= currentTime;
      });

      return timeFilteredData.map((item) => ({
        ...item,
        timestamp: parseTimestamp(item.Current_Phase_A_TIMESTAMP).toLocaleTimeString(),
      }));
    }

    // For Daily, Weekly, and Monthly, we aggregate the data
    const aggregationMap = new Map<string, PowerDataItem[]>();
    data.forEach((item) => {
      const date = parseTimestamp(item.Current_Phase_A_TIMESTAMP);
      let key = "";

      switch (granularity) {
        case "daily":
          key = date.toLocaleDateString("en-CA"); // YYYY-MM-DD
          break;
        case "weekly":
          key = getStartOfWeek(date); // YYYY-MM-DD of week start
          break;
        case "monthly":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
          break;
      }

      if (key) {
        if (!aggregationMap.has(key)) aggregationMap.set(key, []);
        aggregationMap.get(key)!.push(item);
      }
    });
    
    const avg = (arr: number[]) =>
        arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    return Array.from(aggregationMap.entries())
      .map(([key, values]) => ({
        timestamp: key,
        Current_Phase_A_VALUE: avg(values.map((v) => v.Current_Phase_A_VALUE)),
        Current_Phase_B_VALUE: avg(values.map((v) => v.Current_Phase_B_VALUE)),
        Current_Phase_C_VALUE: avg(values.map((v) => v.Current_Phase_C_VALUE)),
        Real_Power_Total_VALUE: avg(values.map((v) => v.Real_Power_Total_VALUE)),
        Voltage_A_B_VALUE: avg(values.map((v) => v.Voltage_A_B_VALUE)),
        Voltage_B_C_VALUE: avg(values.map((v) => v.Voltage_B_C_VALUE)),
        Voltage_C_A_VALUE: avg(values.map((v) => v.Voltage_C_A_VALUE)),
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [data, granularity, startTime, endTime]);

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Power Monitoring Dashboard
          </h1>
        </header>

        <InputForm
          ownerId={ownerId} setOwnerId={setOwnerId}
          startDate={startDate} setStartDate={setStartDate}
          endDate={endDate} setEndDate={setEndDate}
          isLoading={isLoading} handleSubmit={handleSubmit}
        />

        {isLoading && <LoadingSpinner />}
        {error && <ErrorDisplay error={{ message: error }} />}

        {data && !isLoading && (
          <div className="flex flex-col gap-8 mt-8">
            {data.length > 0 ? (
              <>
                {/* Chart Section */}
                <ChartComponent
                  chartData={chartData}
                  granularity={granularity} setGranularity={setGranularity}
                  chartMode={chartMode} setChartMode={setChartMode}
                  startTime={startTime} setStartTime={setStartTime}
                  endTime={endTime} setEndTime={setEndTime}
                />
                {/* Table Section */}
                <div className="w-full">
                  <div className="overflow-y-auto max-h-[600px] bg-white p-4 rounded-xl shadow-md">
                    <TableComponent data={data} />
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-center min-h-[500px]">
                <p className="text-gray-500 text-lg font-medium">
                  📊 No data available for the selected criteria.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}