'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTutorBookmarks } from '@/lib/hooks/useTutorBookmarks';
import {
  useTutorSearch,
  useFilterManagement,
  useTutorFetch,
  useTeacherSections,
} from './hooks';
import {
  TeacherCard,
  SortDropdown,
} from './components';
import { SortOption } from '@/types/TutorsList';
import { AdvancedFilter, FilterField } from '@/components/common/AdvancedFilter';

export const TutorComponent = () => {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortOption>('rating-desc');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  // Use custom hooks
  const [searchInput, debouncedSearch, setSearchInput] = useTutorSearch();
  const { filters, clearFilters, updateFilter } = useFilterManagement();
  const { loading, error, tutors } = useTutorFetch(debouncedSearch, filters, sortBy);
  const {
    isAuthenticated,
    loadingBookmarks,
    bookmarkedSet,
    bookmarkedTutors,
    toggleBookmark,
  } = useTutorBookmarks();
  const teachers = useTeacherSections(showBookmarkedOnly ? bookmarkedTutors : tutors);

  const filterFields: FilterField[] = [
    { id: 'subject', label: 'Subject', type: 'text', placeholder: 'e.g. Mathematics' },
    { id: 'minRating', label: 'Min Rating', type: 'number', placeholder: 'e.g. 4.5' },
    { id: 'maxRate', label: 'Max Rate', type: 'number', placeholder: 'e.g. 1500' },
    { id: 'skills', label: 'Skills', type: 'text', placeholder: 'e.g. Algebra, Calculus' },
  ];

  const handleFilterChange = (key: string, value: any) => {
    updateFilter(key as any, value);
  };

  const handleToggleBookmarkTutor = async (tutorId: string) => {
    try {
      const result = await toggleBookmark(tutorId);
      if (result?.requiresAuth) {
        router.push('/login');
      }
    } catch {
      // Keep UX silent here to match existing behavior patterns.
    }
  };

  const handleToggleBookmarkedView = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setShowBookmarkedOnly((prev) => !prev);
  };

  return (
    <div className="max-w-400 mx-auto p-2 md:p-6 pt-2 md:pt-2">
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

      {/* Reusable Advanced Filter component */}
      <div className="mb-6">
        <AdvancedFilter
          searchPlaceholder="Search teachers by name or keywords..."
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          fields={filterFields}
          filterValues={filters}
          onFilterChange={handleFilterChange}
          onReset={clearFilters}
          onApply={() => {}}
        />
      </div>

      {/* Sorting & Filter Summaries Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 px-1">
        <div className="text-sm font-medium text-gray-500 bg-white/60 px-3 py-1.5 rounded-xl inline-block border border-gray-100">
          Found <span className="text-gray-900 font-bold">{teachers.length}</span> amazing teachers
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
          
          <button
            onClick={handleToggleBookmarkedView}
            className={`p-2.5 rounded-xl shadow-sm ring-1 transition-colors flex items-center gap-2 text-sm font-bold ${
              showBookmarkedOnly
                ? 'bg-amber-50 ring-amber-200 text-amber-700 hover:bg-amber-100'
                : 'bg-white ring-gray-100 text-gray-600 hover:bg-gray-50'
            }`}
            title={showBookmarkedOnly ? 'Show all tutors' : 'Show bookmarked tutors'}
          >
            <Bookmark
              className={`w-4 h-4 ${showBookmarkedOnly ? 'fill-amber-500 text-amber-600' : 'text-gray-600'}`}
            />
            <span>{showBookmarkedOnly ? 'Bookmarked' : 'Bookmarks'}</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {(loading || (showBookmarkedOnly && loadingBookmarks)) && (
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
      {!loading && !error && teachers.length === 0 && (
        <div className="text-sm text-gray-500 mb-8">
          {showBookmarkedOnly ? 'No bookmarked tutors yet.' : 'No tutors found.'}
        </div>
      )}

      {/* Teachers Grid */}
      {!loading && !error && teachers.length > 0 && (
        <div className="mb-12">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                teacher={teacher}
                isBookmarked={bookmarkedSet.has(String(teacher.id))}
                onToggleBookmark={handleToggleBookmarkTutor}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorComponent;
