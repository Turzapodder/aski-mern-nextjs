'use client';

import React, { useState } from 'react';
import { Search, Filter, RotateCcw, X, Calendar } from 'lucide-react';

export interface FilterField {
  id: string;
  label: string;
  type: 'select' | 'text' | 'date-range' | 'number';
  placeholder?: string;
  options?: { value: string; label: string }[];
}

interface AdvancedFilterProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit?: () => void;
  fields: FilterField[];
  filterValues: Record<string, any>;
  onFilterChange: (id: string, value: any) => void;
  onReset: () => void;
  onApply: () => void;
}

export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  onSearchSubmit,
  fields,
  filterValues,
  onFilterChange,
  onReset,
  onApply,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit();
    } else {
      onApply();
    }
  };

  const activeFiltersCount = Object.keys(filterValues).filter(
    (key) => filterValues[key] !== '' && filterValues[key] !== 'all' && filterValues[key] !== undefined
  ).length;

  return (
    <div className="w-full space-y-4">
      {/* Search Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="w-full bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-100 p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-center shadow-sm"
      >
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-550 w-5 h-5" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl focus:border-black focus:bg-white transition-all duration-200 outline-none text-gray-900 font-semibold placeholder-gray-500 text-sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
          <button
            type="submit"
            className="bg-black hover:bg-gray-900 text-white font-bold px-4 md:px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm text-sm"
          >
            <Search className="w-4 h-4" />
            <span>Apply</span>
          </button>

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className={`px-4 md:px-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border shadow-sm ${
              isOpen || activeFiltersCount > 0
                ? 'bg-black border-black text-white hover:bg-gray-900'
                : 'bg-white border-gray-250 text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold transition-all ${
                isOpen || activeFiltersCount > 0 ? 'bg-white text-black' : 'bg-black text-white'
              }`}>
                {activeFiltersCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="px-4 md:px-5 py-3 bg-white border border-gray-250 hover:bg-gray-50 text-gray-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </form>

      {/* Advanced Filter Panel */}
      {isOpen && (
        <div className="w-full bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-8 shadow-md animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-black" />
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest">
                Advanced Filtering
              </h4>
            </div>
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            {fields.map((field) => {
              if (field.type === 'select') {
                return (
                  <div key={field.id} className="space-y-2">
                    <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                      {field.label}
                    </label>
                    <select
                      value={filterValues[field.id] || 'all'}
                      onChange={(e) => onFilterChange(field.id, e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-black focus:bg-white transition-all outline-none text-sm text-gray-900 font-semibold cursor-pointer"
                    >
                      <option value="all">Any</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              if (field.type === 'date-range') {
                const rangeValue = filterValues[field.id] || { from: '', to: '' };
                return (
                  <div key={field.id} className="lg:col-span-2 space-y-2">
                    <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                      {field.label}
                    </label>
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-black transition-all">
                      <Calendar className="w-4 h-4 text-gray-550 shrink-0" />
                      <input
                        type="date"
                        value={rangeValue.from || ''}
                        onChange={(e) =>
                          onFilterChange(field.id, { ...rangeValue, from: e.target.value })
                        }
                        className="bg-transparent border-none text-sm text-gray-900 font-semibold outline-none w-full"
                        placeholder="From"
                      />
                      <span className="text-gray-900 text-xs shrink-0 font-semibold">to</span>
                      <input
                        type="date"
                        value={rangeValue.to || ''}
                        onChange={(e) =>
                          onFilterChange(field.id, { ...rangeValue, to: e.target.value })
                        }
                        className="bg-transparent border-none text-sm text-gray-900 font-semibold outline-none w-full"
                        placeholder="To"
                      />
                    </div>
                  </div>
                );
              }

              if (field.type === 'number') {
                return (
                  <div key={field.id} className="space-y-2">
                    <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                      {field.label}
                    </label>
                    <input
                      type="number"
                      placeholder={field.placeholder || 'e.g. 100'}
                      value={filterValues[field.id] || ''}
                      onChange={(e) => onFilterChange(field.id, e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-black focus:bg-white transition-all outline-none text-sm text-gray-900 font-semibold placeholder-gray-550"
                    />
                  </div>
                );
              }

              return (
                <div key={field.id} className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    placeholder={field.placeholder || 'Search...'}
                    value={filterValues[field.id] || ''}
                    onChange={(e) => onFilterChange(field.id, e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-black focus:bg-white transition-all outline-none text-sm text-gray-900 font-semibold placeholder-gray-550"
                  />
                </div>
              );
            })}

            {/* Actions for Advanced Filtering */}
            <div className="flex items-center gap-3 md:col-span-2 lg:col-span-4 justify-end pt-4 border-t border-gray-100 mt-4">
              <button
                type="button"
                onClick={onApply}
                className="bg-black hover:bg-gray-900 text-white font-bold px-6 py-2.5 rounded-xl transition-all active:scale-[0.98] shadow-sm text-sm"
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="bg-white border border-gray-250 hover:bg-gray-50 text-gray-900 font-bold px-6 py-2.5 rounded-xl transition-all text-sm shadow-sm"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
