import React from "react";

import { useState, useMemo } from "react";

// In a real app, you would fetch these categories from an API
interface Category {
  id: number;
  name: string;
  type: string;
}

const STATUSES = ["SAFE", "CAUTION", "BELOW"];

interface FiltersProps {
  searchText: string;
  onSearchTextChange: (text: string) => void;
  onSearchSubmit: () => void; // New handler for the button
  categories: Category[];
  selectedCategories: number[];
  onCategoryChange: (categoryId: number) => void;
  selectedStatuses: string[];
  onStatusChange: (status: string) => void;
  showSearch?: boolean;
  showStatusFilter?: boolean;
}

export const Filters = ({
  searchText,
  onSearchTextChange,
  onSearchSubmit,
  categories,
  selectedCategories,
  onCategoryChange,
  selectedStatuses,
  onStatusChange,
  showSearch = true,
  showStatusFilter = true,
}: FiltersProps) => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  // Group categories by their type (e.g., "MECHANICAL")
  const groupedCategories = useMemo(() => {
    return categories.reduce((acc, category) => {
      const type = category.type || "UNCATEGORIZED";
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(category);
      return acc;
    }, {} as Record<string, Category[]>);
  }, [categories]);

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      onSearchSubmit();
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg border space-y-6">
      {/* --- Search Bar and Button --- */}
      {showSearch && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search Item e.g., ball bearing"
            value={searchText}
            onChange={(e) => onSearchTextChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="flex-grow p-2 border border-gray-300 rounded-md text-black"
          />
          <button
            onClick={onSearchSubmit}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
          >
            Search
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* --- Grouped Category Dropdown --- */}
        <div className="relative">
          <label className="block text-sm font-medium text-black mb-1">
            Filter by Category
          </label>
          <button
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="w-full p-2 bg-white border border-gray-300 rounded-md text-left text-black"
          >
            {selectedCategories.length > 0
              ? `${selectedCategories.length} selected`
              : "Select Categories"}
          </button>
          {isCategoryOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto p-4">
              {Object.entries(groupedCategories).map(([type, cats]) => (
                <div key={type} className="mb-4">
                  <h3 className="font-bold text-sm text-gray-500 uppercase mb-2">
                    {type}
                  </h3>
                  {cats.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center space-x-2 text-black mb-1"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => onCategoryChange(cat.id)}
                        className="rounded"
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- Modern Status Filter --- */}
        {showStatusFilter && (
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Filter by Stock Status
            </label>
            <div className="flex rounded-md border border-gray-300 p-0.5">
              {STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => onStatusChange(status)}
                  className={`flex-1 text-center text-sm px-3 py-1.5 rounded-md transition-colors ${
                    selectedStatuses.includes(status)
                      ? "bg-blue-500 text-white"
                      : "bg-transparent text-black hover:bg-gray-100"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
