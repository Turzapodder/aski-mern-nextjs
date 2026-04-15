import React from 'react';
import { Filters } from '../../../types/TutorsList';

interface FilterPanelProps {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: string) => void;
  onClearFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  return (
    <div className="w-full rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 mb-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label className="text-xs font-medium text-gray-500">Subject</label>
          <input
            type="text"
            value={filters.subject}
            onChange={(e) => onFilterChange('subject', e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-100 bg-[#fafafa] px-3 py-2 text-sm text-gray-700 outline-none focus:border-purple-200 focus:ring-2 focus:ring-purple-100"
            placeholder="e.g. Mathematics"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Min rating</label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={filters.minRating}
            onChange={(e) => onFilterChange('minRating', e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-100 bg-[#fafafa] px-3 py-2 text-sm text-gray-700 outline-none focus:border-purple-200 focus:ring-2 focus:ring-purple-100"
            placeholder="e.g. 4.5"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Max rate</label>
          <input
            type="number"
            min="0"
            step="1"
            value={filters.maxRate}
            onChange={(e) => onFilterChange('maxRate', e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-100 bg-[#fafafa] px-3 py-2 text-sm text-gray-700 outline-none focus:border-purple-200 focus:ring-2 focus:ring-purple-100"
            placeholder="e.g. 1500"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Skills</label>
          <input
            type="text"
            value={filters.skills}
            onChange={(e) => onFilterChange('skills', e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-100 bg-[#fafafa] px-3 py-2 text-sm text-gray-700 outline-none focus:border-purple-200 focus:ring-2 focus:ring-purple-100"
            placeholder="e.g. Algebra, Geometry"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-500">Use comma-separated values for skills.</p>
        <button
          onClick={onClearFilters}
          className="text-xs font-semibold text-purple-600 hover:text-purple-700"
        >
          Clear filters
        </button>
      </div>
    </div>
  );
};
