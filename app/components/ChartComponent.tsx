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
import DrillControls from "./DrillControls";

interface ChartComponentProps {
  granularity: "live" | "day" | "month";
  setGranularity: (value: "live" | "day" | "month") => void;
  chartData: {
    timestamp: string;
    Current_Phase_A_VALUE: number;
    Current_Phase_B_VALUE: number;
    Current_Phase_C_VALUE: number;
    Real_Power_Total_VALUE: number;
  }[];
}

export default function ChartComponent({
  granularity,
  setGranularity,
  chartData,
}: ChartComponentProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-black">
          Real-Time Power Metrics
        </h2>
        <DrillControls
          granularity={granularity}
          setGranularity={setGranularity}
        />
      </div>
      <div
        style={{
          width: "100%",
          height: 400,
          overflowX: granularity === "live" ? "auto" : "hidden",
        }}
      >
        <ResponsiveContainer
          width={
            granularity === "live"
              ? Math.max(chartData.length * 50, 100)
              : "100%"
          }
          height={400}
        >
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              angle={-45}
              textAnchor="end"
              height={70}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                borderRadius: "0.5rem",
                border: "1px solid #ccc",
              }}
            />
            <div className="mt-8">
            <Legend />
            </div>
            <Line
              type="monotone"
              dataKey="Current_Phase_A_VALUE"
              name="Current A"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Current_Phase_B_VALUE"
              name="Current B"
              stroke="#82ca9d"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Current_Phase_C_VALUE"
              name="Current C"
              stroke="#ffc658"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Real_Power_Total_VALUE"
              name="Total Real Power"
              stroke="#ff7300"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
