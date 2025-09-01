// src/components/ChartComponent.tsx

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DrillControls, { Granularity } from "./DrillControls";
import ChartModeControls, { ChartDisplayMode } from "./ChartModeControls";

interface ChartComponentProps {
  chartData: Array<{
    timestamp: string;
    Current_Phase_A_VALUE?: number;
    Current_Phase_B_VALUE?: number;
    Current_Phase_C_VALUE?: number;
    Real_Power_Total_VALUE?: number;
    Voltage_A_B_VALUE?: number;
    Voltage_B_C_VALUE?: number;
    Voltage_C_A_VALUE?: number;
    // Add other keys as needed based on aggregation
  }>; // Data can have varying keys based on aggregation
  granularity: Granularity;
  setGranularity: (value: Granularity) => void;
  chartMode: ChartDisplayMode;
  setChartMode: (mode: ChartDisplayMode) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  endTime: string;
  setEndTime: (time: string) => void;
}

export default function ChartComponent({
  chartData,
  granularity,
  setGranularity,
  chartMode,
  setChartMode,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
}: ChartComponentProps) {

  console.log("Chart Data Received:", chartData);
  const showPower = chartMode === "power" || chartMode === "both";
  const showVoltage = chartMode === "voltage" || chartMode === "both";

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 sm:mb-0">
          Power Metrics
        </h2>
      </div>

      {/* Controls Section */}
      <div className="flex flex-wrap justify-end items-center gap-4 mb-4 p-2 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <label htmlFor="startTime" className="text-sm font-medium text-gray-600">
            Time Range:
          </label>
          <input
            type="time"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm text-sm p-1.5"
          />
          <span className="text-gray-500">-</span>
          <input
            type="time"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm text-sm p-1.5"
          />
        </div>
        <ChartModeControls chartMode={chartMode} setChartMode={setChartMode} />
        <DrillControls
          granularity={granularity}
          setGranularity={setGranularity}
        />
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="timestamp"
            angle={-45}
            textAnchor="end"
            tick={{ fontSize: 12 }}
            height={70}
          />

          {/* Left Y-Axis for Power & Current */}
          <YAxis yAxisId="left" stroke="#8884d8" hide={!showPower} />

          {/* Right Y-Axis for Voltage */}
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#ff7300"
            hide={!showVoltage}
            domain={['auto', 'auto']}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "0.5rem",
              border: "1px solid #ccc",
            }}
          />
          <Legend wrapperStyle={{ bottom: 0 }} />

          {/* Power and Current Lines */}
          {showPower && (
            <>
              <Line yAxisId="left" type="monotone" dataKey="Current_Phase_A_VALUE" name="Current A (A)" stroke="#8884d8" dot={false}/>
              <Line yAxisId="left" type="monotone" dataKey="Current_Phase_B_VALUE" name="Current B (A)" stroke="#82ca9d" dot={false}/>
              <Line yAxisId="left" type="monotone" dataKey="Current_Phase_C_VALUE" name="Current C (A)" stroke="#ffc658" dot={false}/>
              <Line yAxisId="left" type="monotone" dataKey="Real_Power_Total_VALUE" name="Real Power (W)" stroke="#d0021b" dot={false}/>
            </>
          )}

          {/* Voltage Lines */}
          {showVoltage && (
            <>
              <Line yAxisId="right" type="monotone" dataKey="Voltage_A_B_VALUE" name="Voltage A-B (V)" stroke="#4a90e2" dot={false}/>
              <Line yAxisId="right" type="monotone" dataKey="Voltage_B_C_VALUE" name="Voltage B-C (V)" stroke="#50e3c2" dot={false}/>
              <Line yAxisId="right" type="monotone" dataKey="Voltage_C_A_VALUE" name="Voltage A-C (V)" stroke="#f5a623" dot={false}/>
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}