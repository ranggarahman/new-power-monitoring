import React from "react";
import { CriticalItem } from "@/app/types";

interface SparePartTableProps {
  items: CriticalItem[];
  isLoading: boolean;
}

const statusOptions = ["SAFE", "CAUTION", "BELOW"] as const;
type StatusType = (typeof statusOptions)[number];

const colorClasses: Record<StatusType, string> = {
  SAFE: "bg-green-100 text-green-800",
  CAUTION: "bg-yellow-100 text-yellow-800",
  "BELOW": "bg-red-100 text-red-800",
};

const StatusBadge = ({ status }: { status: string }) => {
  const colorClass = statusOptions.includes(status as StatusType)
    ? colorClasses[status as StatusType]
    : "bg-gray-100 text-gray-800";
  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${colorClass}`}
    >
      {status}
    </span>
  );
};

export const SparePartTable = ({ items, isLoading }: SparePartTableProps) => {
  if (isLoading) {
    return (
      <div className="text-center p-8 text-black">Loading spare parts...</div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center p-8 text-black">
        No items found matching your criteria.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left text-sm font-semibold text-black">
              Material ID
            </th>
            <th className="p-3 text-left text-sm font-semibold text-black">
              Description
            </th>
            <th className="p-3 text-left text-sm font-semibold text-black">
              Category
            </th>
            <th className="p-3 text-center text-sm font-semibold text-black">
              Stock
            </th>
            <th className="p-3 text-center text-sm font-semibold text-black">
              Min Stock
            </th>
            <th className="p-3 text-center text-sm font-semibold text-black">
              Status
            </th>
            <th className="p-3 text-center text-sm font-semibold text-black">
              Price
            </th>
            <th className="p-3 text-center text-sm font-semibold text-black">
              Location
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.material_id} className="border-b hover:bg-gray-50">
              <td className="p-3 text-sm text-black font-mono">
                {item.material_id}
              </td>
              <td className="p-3 text-sm text-black">
                {" "}
                <div>{item.short_desc}</div>
                <div className="text-xs text-gray-500">{item.long_desc}</div>
              </td>
              <td className="p-3 text-sm text-black">{item.category_name}</td>
              <td className="p-3 text-sm text-black text-center">
                {item.current_stock}
              </td>
              <td className="p-3 text-sm text-black text-center">
                {item.min_stock}
              </td>
              <td className="p-3 text-center">
                <StatusBadge status={item.stock_status} />
              </td>
              <td className="p-3 text-sm text-black text-right">
                {item.price.toLocaleString("id-ID", {
                  style: "currency",
                  currency: "IDR",
                })}
              </td>
              <td className="p-3 text-sm text-black">
                {item.location || "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
