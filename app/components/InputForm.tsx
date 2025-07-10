import React from "react";

type InputFormProps = {
  ownerId: string;
  setOwnerId: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

const logOptions = [
  "CFF_1_M1",
  "CFF_1_M2",
  "CFF_1_M3",
  "CFF_1_M4",
  "CFF_1_M5",
  "CFF_1_M6",
  "CFF_1_M7",
  "CFF_2_M1",
  "CFF_2_M2",
  "CFF_2_M3",
  "CFF_2_M6",
  "CFF_2_M8",
  "CFF_2_M9",
  "CFF_2_M10",
  "CPLNG_M1",
  "CPLNG_M2",
  "CPLNG_M3",
  "ISB_M1",
  "ISB_M2",
  "PF_M1",
  "PF_M2",
  "PF_M3",
  "PF_M4",
  "PF_M5",
].sort(); // Sorting the array alphabetically for better UX

export default function InputForm({
  ownerId,
  setOwnerId,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  isLoading,
  handleSubmit,
}: InputFormProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-8">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
      >
        {/* Log File Dropdown */}
        <div className="md:col-span-1">
          <label
            htmlFor="logFile"
            className="block text-sm font-medium text-black mb-1"
          >
            Owner ID
          </label>
          <select
            id="logFile"
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="" disabled>
              Select Owner ID
            </option>
            {logOptions.map((logName) => (
              <option key={logName} value={logName}>
                {logName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-black mb-1"
          >
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-black mb-1"
          >
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {isLoading ? "Loading..." : "Fetch Data"}
        </button>
      </form>
    </div>
  );
}
