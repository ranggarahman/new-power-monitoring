// src/components/DrillControls.tsx

import React from "react";

// 💡 Define the new granularity options
export type Granularity = "today" | "daily" | "weekly" | "monthly";

type DrillControlsProps = {
  granularity: Granularity;
  setGranularity: (value: Granularity) => void;
};

// 💡 Define the button labels and keys
const options: { key: Granularity; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

export default function DrillControls({
  granularity,
  setGranularity,
}: DrillControlsProps) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium text-gray-600">Aggregate:</span>
      {options.map((option) => (
        <button
          key={option.key}
          onClick={() => setGranularity(option.key)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            granularity === option.key
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