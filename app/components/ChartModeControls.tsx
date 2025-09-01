// src/components/ChartModeControls.tsx

import React from "react";

export type ChartDisplayMode = "power" | "voltage" | "both";

type ChartModeControlsProps = {
  chartMode: ChartDisplayMode;
  setChartMode: (mode: ChartDisplayMode) => void;
};

const options: { key: ChartDisplayMode; label: string }[] = [
  { key: "power", label: "Power & Current" },
  { key: "voltage", label: "Voltage" },
  { key: "both", label: "Both" },
];

export default function ChartModeControls({
  chartMode,
  setChartMode,
}: ChartModeControlsProps) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium text-gray-600">View:</span>
      {options.map((option) => (
        <button
          key={option.key}
          onClick={() => setChartMode(option.key)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            chartMode === option.key
              ? "bg-blue-500 text-white shadow-sm"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}