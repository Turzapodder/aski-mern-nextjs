"use client"
// TutorFilters — search bar + advanced filter panel extracted from TutorComponent
import { Bookmark, ChevronDown, Filter, Search } from "lucide-react"

interface Filters {
    subject: string
    minRating: string
    maxRate: string
    skills: string
    availability: string
}

interface TutorFiltersProps {
    filters: Filters
    filtersOpen: boolean
    onFilterChange: (key: keyof Filters, value: string) => void
    onToggleFilters: () => void
    onClearFilters: () => void
}

export function TutorFilters({
    filters,
    filtersOpen,
    onFilterChange,
    onToggleFilters,
    onClearFilters,
}: TutorFiltersProps) {
    return (
        <>
            <div className="flex flex-col md:flex-row gap-4 mb-10 items-center">
                <div className="relative flex-grow w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search teachers"
                        value={filters.subject}
                        onChange={(e) => onFilterChange("subject", e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border-none rounded-xl shadow-sm outline-none text-gray-700 placeholder-gray-400 ring-1 ring-gray-100 focus:ring-2 focus:ring-purple-100"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm ring-1 ring-gray-100 cursor-pointer min-w-max">
                        <span className="text-sm text-gray-500">Sort:</span>
                        <span className="text-sm font-medium text-gray-900">Most popular</span>
                        <ChevronDown className="w-4 h-4 text-gray-500 ml-1" />
                    </div>

                    <button
                        onClick={onToggleFilters}
                        className={`p-3 bg-white rounded-xl shadow-sm ring-1 ring-gray-100 hover:bg-gray-50 ${filtersOpen ? "ring-purple-200" : ""}`}
                    >
                        <Filter className="w-5 h-5 text-gray-600" />
                    </button>

                    <button className="p-3 bg-white rounded-xl shadow-sm ring-1 ring-gray-100 hover:bg-gray-50">
                        <Bookmark className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {filtersOpen && (
                <div className="w-full rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 mb-8">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        {[
                            { key: "minRating" as const, label: "Min rating", placeholder: "e.g. 4.5", type: "number", step: "0.1", min: "0", max: "5" },
                            { key: "maxRate" as const, label: "Max rate", placeholder: "e.g. 1500", type: "number", step: "1", min: "0" },
                            { key: "skills" as const, label: "Skills", placeholder: "e.g. Algebra, Geometry", type: "text" },
                            { key: "availability" as const, label: "Availability", placeholder: "e.g. Sunday, Monday", type: "text" },
                        ].map(({ key, label, placeholder, type, ...rest }) => (
                            <div key={key}>
                                <label className="text-xs font-medium text-gray-500">{label}</label>
                                <input
                                    type={type}
                                    value={filters[key]}
                                    onChange={(e) => onFilterChange(key, e.target.value)}
                                    className="mt-2 w-full rounded-xl border border-gray-100 bg-[#fafafa] px-3 py-2 text-sm text-gray-700 outline-none focus:border-purple-200 focus:ring-2 focus:ring-purple-100"
                                    placeholder={placeholder}
                                    {...rest}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-gray-500">Use comma-separated values for skills and availability.</p>
                        <button onClick={onClearFilters} className="text-xs font-semibold text-purple-600 hover:text-purple-700">
                            Clear filters
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
