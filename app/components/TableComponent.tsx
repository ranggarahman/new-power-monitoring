import { PowerDataItem } from "../types";

interface TableComponentProps {
    data: PowerDataItem[]
}

export default function TableComponent({data} : TableComponentProps) {
  return (
    <div className="bg-white rounded-xl shadow-md flex flex-col h-full">
      <h2 className="text-2xl font-semibold text-black p-6 flex-shrink-0">
        Detailed Data Log
      </h2>
      <div className="flex-1 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {data[0] &&
                Object.keys(data[0]).map((key) => (
                  <th
                    key={key}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {key.replace(/_/g, " ")}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {Object.values(row).map((value, i) => (
                  <td
                    key={i}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-800"
                  >
                    {typeof value === "number"
                      ? value.toFixed(2)
                      : String(value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
