import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalItems, limit, onPageChange }: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / limit);
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-between items-center p-4">
      <span className="text-sm text-black">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm text-black bg-white border rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm text-black bg-white border rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};