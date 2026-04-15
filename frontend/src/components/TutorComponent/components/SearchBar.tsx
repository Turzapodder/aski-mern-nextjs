import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ searchInput, onSearchChange }) => {
  return (
    <div className="relative grow w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        placeholder="Search teachers"
        value={searchInput}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-11 pr-4 py-3 bg-white border-none rounded-xl shadow-sm outline-none text-gray-700 placeholder-gray-400 ring-1 ring-gray-100 focus:ring-2 focus:ring-purple-100"
      />
    </div>
  );
};
