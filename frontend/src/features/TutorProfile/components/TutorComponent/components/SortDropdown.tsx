import React, { useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { SortOption } from '@/types/TutorsList';

interface SortDropdownProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const sortOptions:{ value: SortOption; label: string }[] = [
  { value: 'rating-desc', label: 'Most popular' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'subject-asc', label: 'Subject: A to Z' },
  { value: 'subject-desc', label: 'Subject: Z to A' },
];

const sortLabelMap: Record<SortOption, string> = {
  'rating-desc': 'Most popular',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  'subject-asc': 'Subject: A to Z',
  'subject-desc': 'Subject: Z to A',
};

export const SortDropdown: React.FC<SortDropdownProps> = ({ sortBy, onSortChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm ring-1 ring-gray-100 hover:ring-purple-200 transition-all min-w-max cursor-pointer"
      >
        <span className="text-sm text-gray-500">Sort:</span>
        <span className="text-sm font-medium text-gray-900">{sortLabelMap[sortBy]}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg ring-1 ring-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="py-2">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onSortChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  sortBy === option.value
                    ? 'bg-purple-50 text-purple-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
