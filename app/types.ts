export interface PowerDataItem {
    Current_Phase_A_TIMESTAMP: string;
    Voltage_A_B_Value: number;
    Voltage_B_C_Value: number;
    Voltage_A_C_Value: number;
    Current_Phase_A_VALUE: number;
    Current_Phase_B_VALUE: number;
    Current_Phase_C_VALUE: number;
    Real_Power_Total_VALUE: number;
    powerFactor: number;
    // [key: string]: string | number;
}

//   // --- Event Handlers ---
export interface ErrorDisplayProps {
    error: { message?: string } | null;
}