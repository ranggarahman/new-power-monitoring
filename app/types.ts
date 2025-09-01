export interface PowerDataItem {
    Current_Phase_A_TIMESTAMP: string;
    Voltage_A_B_VALUE: number;
    Voltage_B_C_VALUE: number;
    Voltage_C_A_VALUE: number;
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


export interface Location {
  id: number;
  text: string;
}

export interface EquipmentNode {
  id: number;
  text: string;
  children?: EquipmentNode[];
}

export interface LocationDropdown {
  level: number;
  options: Location[];
  selectedValue: string; // Use string to match the <select> element's value
}

export interface Message {
    text: string;
    type: 'success' | 'error';
}

export interface CriticalItem {
  material_id: string;
  short_desc: string;
  long_desc?: string; // New
  category_name: string;
  min_stock: number;
  current_stock: number;
  stock_status: string;
  price: number; // New
  status?: string; // New
  location?: string; // New
}