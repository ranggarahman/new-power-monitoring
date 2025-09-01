import { useState, useEffect } from 'react';
import { CriticalItem } from '@/app/types';

// Define the shape of the search criteria and the API response
interface SearchCriteria {
  searchText?: string;
  categoryIds?: number[];
  stockStatuses?: string[];
}

// The custom hook
export const useSpareParts = (criteria: SearchCriteria) => {
  const [items, setItems] = useState<CriticalItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpareParts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://10.60.75.142:8181/sparepart/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            search_text: criteria.searchText,
            category_ids: criteria.categoryIds,
            stock_statuses: criteria.stockStatuses,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data from the API.');
        }

        const result: CriticalItem[] = await response.json();
        setItems(result);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpareParts();
  }, [criteria]); // Re-fetch whenever criteria or page changes

  return { items, isLoading, error };
};