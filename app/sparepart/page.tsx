"use client"; // This component needs to be a client component to use hooks and state

import { useState, useEffect, useMemo } from "react";
import { useSpareParts } from "./hooks/useSpareParts";
import { Filters } from "./components/Filters";
import { SparePartTable } from "./components/SparePartTable";

import AnalyticsDashboard from "./components/AnalyticsDashboard"; // Adjust the import path if needed
import { LuLayoutList, LuChartPie } from "react-icons/lu";

interface Category {
  id: number;
  name: string;
  type: string; // <-- ADD THIS LINE
}

// --- NEW: A type for clarity ---
type ActiveTab = "search" | "analytics";

export default function SparePartPage() {
  // State for filters and pagination
  const [searchInput, setSearchInput] = useState("");

  // This state will now only be updated when the user clicks "Search"
  const [activeTab, setActiveTab] = useState<ActiveTab>("analytics");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  //const [currentPage, setCurrentPage] = useState(1);

  const [categoryList, setCategoryList] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          "http://10.60.75.142:8181/sparepart/categories"
        );
        if (!response.ok) {
          throw new Error("Could not fetch categories");
        }
        const data: Category[] = await response.json();
        setCategoryList(data);
      } catch (error) {
        console.error(error);
        // Handle error, e.g., show a toast notification
      }
    };
    fetchCategories();
  }, []);

  // STEP 2: Wrap the searchCriteria object creation in useMemo
  const searchCriteria = useMemo(
    () => ({
      searchText: activeSearch.trim() || undefined,
      categoryIds:
        selectedCategories.length > 0 ? selectedCategories : undefined,
      stockStatuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
    }),
    [activeSearch, selectedCategories, selectedStatuses]
  ); // Dependency array

  const handleSearch = () => {
    setActiveSearch(searchInput);
  };

  // The custom hook handles all the fetching logic
  const { items, isLoading, error } = useSpareParts(searchCriteria);

  // Handlers for updating filter state (state hoisting)
  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  return (
    <main className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Critical Spare Parts
        </h1>

        <div className="mb-6 border-b border-gray-200">
          <nav
            className="flex flex-row items-center -mb-px flex space-x-6"
            aria-label="Tabs"
          >
            <button
              onClick={() => setActiveTab("analytics")}
              className={`${
                activeTab === "analytics"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              } flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              <LuChartPie className="mr-2 h-5 w-5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("search")}
              className={`${
                activeTab === "search"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              } flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              <LuLayoutList className="mr-2 h-5 w-5" />
              Search & Filter
            </button>
          </nav>
        </div>

        <div>
          {activeTab === "analytics" && (
            <AnalyticsDashboard categoryList={categoryList} />
          )}
          {activeTab === "search" && (
            <>
              <Filters
                searchText={searchInput}
                onSearchTextChange={setSearchInput}
                onSearchSubmit={handleSearch}
                categories={categoryList}
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
                selectedStatuses={selectedStatuses}
                onStatusChange={handleStatusChange}
                showSearch={true}
                showStatusFilter={true}
              />
              <div className="mt-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                {error && <p className="text-red-500 p-4">Error: {error}</p>}
                <SparePartTable items={items || []} isLoading={isLoading} />
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
