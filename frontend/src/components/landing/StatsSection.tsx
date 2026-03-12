import React from 'react';

export const StatsSection = () => {
  return (
    <section className="py-8 sm:py-10 border-y border-gray-50 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center sm:justify-between items-center gap-6 sm:gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
        {/* Placeholder logos */}
        {['Harvard', 'MIT', 'Stanford', 'Oxford', 'Cambridge'].map((brand) => (
          <span key={brand} className="text-lg sm:text-xl font-bold font-serif opacity-30">
            {brand}
          </span>
        ))}
      </div>
    </section>
  );
};
