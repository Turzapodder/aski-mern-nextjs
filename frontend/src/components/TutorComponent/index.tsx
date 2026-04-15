'use client';
import React, { useState } from 'react';
import { Filter, Bookmark } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useTutorSearch,
  useFilterManagement,
  useTutorFetch,
  useTeacherSections,
} from './hooks';
import {
  TeacherCard,
  SortDropdown,
  SearchBar,
  FilterPanel,
} from './components';
import { SortOption } from '../../types/TutorsList';

export const TutorComponent = () => {
  const [isTeacherAccountActive, setIsTeacherAccountActive] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('rating-desc');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Use custom hooks
  const [searchInput, debouncedSearch, setSearchInput] = useTutorSearch();
  const { filters, clearFilters, updateFilter } = useFilterManagement();
  const { loading, error, tutors } = useTutorFetch(debouncedSearch, filters, sortBy);
  const teachers = useTeacherSections(tutors);

  const handleToggleTeacherAccount = () => {
    setIsTeacherAccountActive(!isTeacherAccountActive);
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    updateFilter(key, value);
  };

  return (
    <div className="max-w-400 mx-auto p-6 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teachers</h1>
          <p className="text-gray-500 text-[15px]">
            Search for specific subjects and find the teachers you&apos;re ready to take a course
            with.
          </p>
        </div>

      </div>

      {/* Search & Controls Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-10 items-center">
        <SearchBar searchInput={searchInput} onSearchChange={setSearchInput} />

        <div className="flex items-center gap-3 w-full md:w-auto">
          <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />

          <button
            onClick={() => setFiltersOpen((prev) => !prev)}
            className={`p-3 bg-white rounded-xl shadow-sm ring-1 ring-gray-100 hover:bg-gray-50 ${
              filtersOpen ? 'ring-purple-200' : ''
            }`}
          >
            <Filter className="w-5 h-5 text-gray-600" />
          </button>

          <button className="p-3 bg-white rounded-xl shadow-sm ring-1 ring-gray-100 hover:bg-gray-50">
            <Bookmark className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {filtersOpen && (
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />
      )}

      {/* Loading State */}
      {loading && (
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>

              <div className="mb-6 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-[92%]" />
                <Skeleton className="h-3 w-[78%]" />
              </div>

              <div className="mb-6 grid grid-cols-2 gap-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>

              <div className="flex items-center justify-between">
                <Skeleton className="h-7 w-28" />
                <Skeleton className="h-9 w-24 rounded-[10px]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && <div className="text-sm text-red-600 mb-8">{error}</div>}

      {/* Empty State */}
      {!loading && !error && tutors.length === 0 && (
        <div className="text-sm text-gray-500 mb-8">No tutors found.</div>
      )}

      {/* Teachers Grid */}
      {!loading && !error && teachers.length > 0 && (
        <div className="mb-12">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorComponent;
