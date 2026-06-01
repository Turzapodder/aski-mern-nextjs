import { useState, useCallback } from 'react';
import { Filters } from '@/types/TutorsList';

const initialFilters: Filters = {
  subject: '',
  minRating: '',
  maxRate: '',
  skills: '',
};

/**
 * Custom hook for managing filter state
 * @returns filters, setFilters, clearFilters, updateFilter
 */
export const useFilterManagement = () => {
  const [filters, setFilters] = useState<Filters>(initialFilters);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const updateFilter = useCallback(
    (key: keyof Filters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  return {
    filters,
    setFilters,
    clearFilters,
    updateFilter,
  };
};
