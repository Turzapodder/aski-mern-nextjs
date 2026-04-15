import { useState, useEffect } from 'react';

/**
 * Custom hook for debounced search input
 * @param initialValue Initial search value
 * @param delay Debounce delay in milliseconds (default: 600ms)
 * @returns [searchInput, debouncedSearch, setSearchInput]
 */
export const useTutorSearch = (initialValue = '', delay = 600) => {
  const [searchInput, setSearchInput] = useState(initialValue);
  const [debouncedSearch, setDebouncedSearch] = useState(initialValue);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput, delay]);

  return [searchInput, debouncedSearch, setSearchInput] as const;
};
