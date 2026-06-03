import { useState, useEffect, useCallback } from 'react';
import { Tutor, Filters, SortOption } from '@/types/TutorsList';

interface FetchState {
  loading: boolean;
  error: string | null;
  tutors: Tutor[];
}

/**
 * Custom hook for fetching tutors with filtering and sorting
 * @param debouncedSearch Search query after debounce
 * @param filters Filter criteria
 * @param sortBy Sort option
 * @returns loading, error, tutors
 */
export const useTutorFetch = (
  debouncedSearch: string,
  filters: Filters,
  sortBy: SortOption
) => {
  const [state, setState] = useState<FetchState>({
    loading: true,
    error: null,
    tutors: [],
  });

  const fetchTutors = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const params = new URLSearchParams();

      // Add search parameter
      if (debouncedSearch) params.set('search', debouncedSearch);

      // Add filter parameters
      if (filters.subject) params.set('subject', filters.subject);
      if (filters.minRating) params.set('minRating', filters.minRating);
      if (filters.maxRate) params.set('maxRate', filters.maxRate);
      if (filters.skills) params.set('skills', filters.skills);

      // Add sort parameters
      const sortMap: Record<SortOption, { sortBy: string; sortOrder: string }> = {
        'rating-desc': { sortBy: 'rating', sortOrder: 'desc' },
        'price-asc': { sortBy: 'hourlyRate', sortOrder: 'asc' },
        'price-desc': { sortBy: 'hourlyRate', sortOrder: 'desc' },
        'subject-asc': { sortBy: 'subject', sortOrder: 'asc' },
        'subject-desc': { sortBy: 'subject', sortOrder: 'desc' },
      };

      const { sortBy: sortField, sortOrder } = sortMap[sortBy];
      params.set('sortBy', sortField);
      params.set('sortOrder', sortOrder);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const queryString = params.toString();
      const response = await fetch(
        `${baseUrl}/api/tutors${queryString ? `?${queryString}` : ''}`
      );

      if (!response.ok) {
        throw new Error('Failed to load tutors');
      }

      const result = await response.json();
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to load tutors');
      }

      setState({
        loading: false,
        error: null,
        tutors: Array.isArray(result.data) ? result.data : [],
      });
    } catch (fetchError: any) {
      setState({
        loading: false,
        error: fetchError?.message || 'Unable to load tutors',
        tutors: [],
      });
    }
  }, [debouncedSearch, filters, sortBy]);

  useEffect(() => {
    fetchTutors();
  }, [fetchTutors]);

  return state;
};
