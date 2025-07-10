import { useState, useCallback } from "react";
import { PowerDataItem } from "../types";

/**
 * Custom hook to fetch power management data from the FastAPI endpoint.
 * @param {string} apiUrl - The URL of the FastAPI endpoint.
 * @returns {{
 * data: PowerDataItem[],
 * isLoading: boolean,
 * error: string,
 * fetchData: (ownerId: string, startDate?: string, endDate?: string) => Promise<void>
 * }}
 */
export const usePowerManagementData = (
  apiUrl: string
): {
  data: PowerDataItem[];
  isLoading: boolean;
  error: string;
  fetchData: (
    ownerId: string,
    startDate?: string,
    endDate?: string
  ) => Promise<void>;
} => {
  const [data, setData] = useState<PowerDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (ownerId: string, startDate?: string, endDate?: string) => {
      setIsLoading(true);
      setError(null);
      setData([]);

      const formData = new FormData();
      formData.append("owner_id", ownerId);
      if (startDate) {
        formData.append("start_date", startDate);
      }
      if (endDate) {
        formData.append("end_date", endDate);
      }

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.detail || `HTTP error! status: ${response.status}`
          );
        }

        const result = await response.json();
        const rawData = result.result || [];

        // Map over the data to calculate and add the power factor
        const processedData = rawData.map((item: PowerDataItem) => {
          const avgVoltage =
            (item.Voltage_A_B_Value +
              item.Voltage_B_C_Value +
              item.Voltage_A_C_Value) /
            3;
          const avgCurrent =
            (item.Current_Phase_A_VALUE +
              item.Current_Phase_B_VALUE +
              item.Current_Phase_C_VALUE) /
            3;
          
          // Apparent Power (S) = sqrt(3) * V_L-L * I_L
          const apparentPower = Math.sqrt(3) * avgVoltage * avgCurrent;
          
          // Real Power is given in Watts, so we divide by 1000 to get kW if needed, but for PF ratio it's fine.
          const realPower = item.Real_Power_Total_VALUE;

          let powerFactor = 0;
          // Avoid division by zero if apparent power is 0
          if (apparentPower > 0) {
            powerFactor = realPower / apparentPower;
          }

          return {
            ...item,
            powerFactor: parseFloat(powerFactor.toFixed(3)), // Add PF to the item, rounded to 3 decimal places
          };
        });

        setData(processedData);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [apiUrl]
  );

  return { data, isLoading, error: error ?? "", fetchData };
};