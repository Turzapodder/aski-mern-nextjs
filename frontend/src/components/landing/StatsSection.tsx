import React from 'react';

export const StatsSection = () => {
    return (
        <section className="py-10 border-y border-gray-50 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 flex justify-between items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                {/* Placeholder logos */}
                {['Harvard', 'MIT', 'Stanford', 'Oxford', 'Cambridge'].map(brand => (
                    <span key={brand} className="text-xl font-bold font-serif">{brand}</span>
                ))}
            </div>
        </section>
    );
};
