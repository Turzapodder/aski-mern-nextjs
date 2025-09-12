'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';

interface MultiSelectProps {
  options: string[];
  placeholder?: string;
  onChange?: (selected: string[]) => void;
}

const pastelColors = [
  'bg-pink-200',
  'bg-purple-200',
  'bg-blue-200',
  'bg-primary-200',
  'bg-yellow-200',
  'bg-orange-200',
  'bg-red-200',
  'bg-indigo-200',
];

export default function MultiSelect({ options, placeholder = 'Choose a tag', onChange }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(
    option => 
      !selected.includes(option) && 
      option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option: string) => {
    const newSelected = [...selected, option];
    setSelected(newSelected);
    onChange?.(newSelected);
    setSearchTerm('');
  };

  const handleRemove = (option: string) => {
    const newSelected = selected.filter(item => item !== option);
    setSelected(newSelected);
    onChange?.(newSelected);
  };

  const getRandomPastelColor = (index: number) => {
    return pastelColors[index % pastelColors.length];
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        className={`w-full bg-gray-50 rounded-lg border ${
          isOpen ? 'border-gray-300' : 'border-gray-200'
        } cursor-pointer`}
      >
        {/* Selected Items Display */}
        <div
          className="min-h-[42px] p-2 flex flex-wrap gap-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selected.length === 0 && !isOpen && (
            <span className="text-gray-500">{placeholder}</span>
          )}
          {selected.map((item, index) => (
            <span
              key={item}
              className={`${getRandomPastelColor(
                index
              )} px-3 py-1 rounded-full flex items-center gap-1`}
            >
              {item}
              <X
                size={14}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(item);
                }}
              />
            </span>
          ))}
        </div>

        {/* Dropdown Icon */}
        <div className="absolute right-2 top-3">
          <ChevronDown
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg border border-gray-200 shadow-lg">
          {/* Search Input */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-gray-300"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.map((option) => (
              <div
                key={option}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  handleSelect(option);
                  //setIsOpen(false);
                }}
              >
                {option}
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <div className="px-4 py-2 text-gray-500">No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}