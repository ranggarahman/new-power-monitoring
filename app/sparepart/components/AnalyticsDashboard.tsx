// app/analytics/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { Filters } from './Filters'; // We will use your reusable filter component
import { VscLoading } from 'react-icons/vsc';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// DEFINE THE TYPE FOR THE CATEGORY OBJECT
// This ensures TypeScript knows the shape of the data in categoryList
interface Category {
  id: number;
  name: string;
  type: string;
}

// DEFINE THE PROPS FOR OUR DASHBOARD COMPONENT
// It needs the categoryList to populate the filter dropdown
interface AnalyticsDashboardProps {
  categoryList: Category[];
}

// Helper to format currency
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
};

// Colors for our charts
const STATUS_COLORS = ['#22c55e', '#f59e0b', '#ef4444']; // Green, Yellow, Red


// The main component now accepts `categoryList` as a prop
export default function AnalyticsDashboard({ categoryList }: AnalyticsDashboardProps) {
  // 1. FETCHING DATA: This hook fetches all analytics data when the component mounts.
  const { overviewData, valueData, isLoading, error } = useAnalytics();
  
  // 2. FILTER STATE: This state is independent and ONLY for this dashboard.
  // It stores the IDs and statuses selected in the Filters component.
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  // 3. THE "BRIDGE": This is a crucial step.
  // The Filters component works with category IDs (e.g., 1, 2, 3).
  // The analytics data is grouped by category names (e.g., "Bearings", "Seals").
  // This `useMemo` creates a fast lookup map to find a category's name from its ID.
  const categoryIdToNameMap = useMemo(() => {
    return new Map(categoryList.map(cat => [cat.id, cat.name]));
  }, [categoryList]);

    // <-- FIX 1: Create the handler function for category changes.
  // This function takes a single `categoryId` and updates the `selectedCategoryIds` array.
  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategoryIds(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // <-- FIX 2: Create the handler function for status changes.
  // This function takes a single `status` string and updates the `selectedStatuses` array.
  const handleStatusChange = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  // 4. DYNAMIC DATA FILTERING: This is the core logic.
  // `useMemo` ensures this complex filtering only runs when the source data or the filters change.
  const filteredData = useMemo(() => {
    // If there's no data from the API yet, return null.
    if (!overviewData || !valueData) {
      return null;
    }

    // A. Get the NAMES of the selected categories from their IDs using our map.
    const selectedCategoryNames = selectedCategoryIds.map(id => categoryIdToNameMap.get(id)).filter(Boolean);

    // B. Filter the main data arrays based on the selected category names.
    const hasCategoryFilter = selectedCategoryNames.length > 0;
    const overviewByCategory = hasCategoryFilter
      ? overviewData.by_category.filter(cat => selectedCategoryNames.includes(cat.category_name))
      : overviewData.by_category;
      
    const valueByCategory = hasCategoryFilter
      ? valueData.by_category.filter(cat => selectedCategoryNames.includes(cat.category_name))
      : valueData.by_category;

    // C. Calculate the totals (Safe, Caution, Below) from the category-filtered data.
    const totals = overviewByCategory.reduce((acc, cat) => {
        acc.totalSafe += cat.safe_count;
        acc.totalCaution += cat.caution_count;
        acc.totalBelow += cat.below_count;
        return acc;
    }, { totalSafe: 0, totalCaution: 0, totalBelow: 0 });

    // D. Apply the status filter on top of the calculated totals.
    // If a status is not selected, its total count becomes 0 for the stat cards and chart.
    const hasStatusFilter = selectedStatuses.length > 0;
    const finalTotalSafe = !hasStatusFilter || selectedStatuses.includes('SAFE') ? totals.totalSafe : 0;
    const finalTotalCaution = !hasStatusFilter || selectedStatuses.includes('CAUTION') ? totals.totalCaution : 0;
    const finalTotalBelow = !hasStatusFilter || selectedStatuses.includes('BELOW') ? totals.totalBelow : 0;

    // E. Return a final, clean object for the JSX to use.
    return { overviewByCategory, valueByCategory, totalSafe: finalTotalSafe, totalCaution: finalTotalCaution, totalBelow: finalTotalBelow };

  }, [overviewData, valueData, selectedCategoryIds, selectedStatuses, categoryIdToNameMap]);


  // --- RENDER LOGIC ---

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center bg-gray-50">
        <VscLoading className="h-12 w-12 animate-spin text-blue-500" />
        <span className="ml-4 text-xl text-gray-700">Loading Analytics...</span>
      </div>
    );
  }

  if (error) { /* Error UI remains the same */ }
  
  // If filteredData hasn't been calculated yet, show a simple message.
  if (!filteredData) {
    return <div className="p-8 text-center text-gray-500">No data available.</div>;
  }

  // Prepare data for the status pie chart.
  const statusChartData = [
      { name: 'Safe', value: filteredData.totalSafe },
      { name: 'Caution', value: filteredData.totalCaution },
      { name: 'Below', value: filteredData.totalBelow },
  ].filter(item => item.value > 0); // Hide slices with a value of 0

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* RENDER THE REUSABLE FILTER COMPONENT */}
      <Filters
        showSearch={false} // We don't need the search bar here
        showStatusFilter={false}
        searchText=""
        onSearchTextChange={() => {}} // Dummy functions as they are not used
        onSearchSubmit={() => {}}
        categories={categoryList}
        selectedCategories={selectedCategoryIds}
        onCategoryChange={handleCategoryChange} // Pass the state setter directly
        selectedStatuses={selectedStatuses}
        onStatusChange={handleStatusChange}     // Pass the state setter directly
      />

      {/* STAT CARDS: These now use the dynamically calculated totals from `filteredData` */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Item Count" value={(filteredData.totalSafe + filteredData.totalCaution + filteredData.totalBelow).toLocaleString()} />
          <StatCard title="Items in Safe" value={filteredData.totalSafe.toLocaleString()} color="green" />
          <StatCard title="Items in Caution" value={filteredData.totalCaution.toLocaleString()} color="yellow" />
          <StatCard title="Items Below Minimum" value={filteredData.totalBelow.toLocaleString()} color="red" />
      </div>

      {/* CHARTS: These also use the `filteredData` and will update automatically */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <TableCard title="Stock Status Proportions">
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                            {statusChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => value.toLocaleString()} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </TableCard>
      </div>


      {/* TABLES: These tables iterate over the filtered data arrays */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <TableCard title="Stock Status by Category">
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Safe ✅</th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Caution ⚠️</th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Below ❗️</th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Total</th>
                    </tr>
                </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredData.overviewByCategory.map((cat) => (
                          <tr key={cat.category_name}>
                              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{cat.category_name}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-green-600">{cat.safe_count.toLocaleString()}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-yellow-600">{cat.caution_count.toLocaleString()}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-bold text-red-600">{cat.below_count.toLocaleString()}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500">{cat.total_items.toLocaleString()}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
        </TableCard>
        <TableCard title="Stock Value by Category">
           <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Total Value</th>
                    </tr>
                </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredData.valueByCategory.map((cat) => (
                          <tr key={cat.category_name}>
                              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{cat.category_name}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-mono text-gray-600">{formatCurrency(cat.total_value)}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
           </div>
        </TableCard>
      </div>
    </div>
  );
}

// Reusable Stat Card component
const StatCard = ({ title, value, color }: { title: string; value: string | number; color?: 'red' | 'yellow' | 'green' }) => {
    const colorClasses = {
        red: 'text-red-600',
        yellow: 'text-yellow-600',
        green: 'text-green-600',
        default: 'text-gray-900'
    };
    const selectedColor = color ? colorClasses[color] : colorClasses.default;

    return (
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">{title}</dt>
            <dd className={`mt-1 text-3xl font-semibold tracking-tight ${selectedColor}`}>{value}</dd>
        </div>
    );
};

// Reusable Table Card component
const TableCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
        </div>
        <div className="border-t border-gray-200 p-4">
            {children}
        </div>
    </div>
);