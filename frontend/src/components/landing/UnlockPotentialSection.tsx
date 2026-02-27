import React from "react";
import Link from "next/link";
import { BookOpen, LayoutDashboard } from "lucide-react";

export const UnlockPotentialSection = () => {
    return (
        <section className="py-24 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl font-bold mb-12">Unlock Your Potential</h2>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-[#FFF8F3] p-10 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="max-w-xs relative z-10">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-6">
                                <BookOpen />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Find Expert Help</h3>
                            <p className="text-gray-600 mb-6">Connect with mentors who can guide you through complex topics.</p>
                            <Link href="#" className="font-bold underline decoration-2 underline-offset-4 hover:text-orange-600 transition-colors">Find a Tutor</Link>
                        </div>
                        <div className="absolute right-0 bottom-0 w-64 h-48 bg-white rounded-tl-[2rem] shadow-sm p-4 translate-y-4 translate-x-4 transition-transform group-hover:translate-x-2 group-hover:translate-y-2">
                            <div className="w-full h-full bg-orange-50 rounded-xl"></div>
                        </div>
                    </div>

                    <div className="bg-[#F3F6FF] p-10 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="max-w-xs relative z-10">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                                <LayoutDashboard />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Track Your Progress</h3>
                            <p className="text-gray-600 mb-6">Keep all your assignments, deadlines, and grades in one organized place.</p>
                            <Link href="#" className="font-bold underline decoration-2 underline-offset-4 hover:text-blue-600 transition-colors">Go to Dashboard</Link>
                        </div>
                        <div className="absolute right-0 bottom-0 w-64 h-48 bg-white rounded-tl-[2rem] shadow-sm p-4 translate-y-4 translate-x-4 transition-transform group-hover:translate-x-2 group-hover:translate-y-2">
                            <div className="space-y-3">
                                {[1, 2].map(i => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                                        <div className="h-2 w-24 bg-gray-100 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
