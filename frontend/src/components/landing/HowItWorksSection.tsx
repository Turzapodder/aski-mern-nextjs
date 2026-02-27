import React from "react";
import { CheckCircle2, BookOpen, Users, ArrowRight } from "lucide-react";

export const HowItWorksSection = () => {
    return (
        <section className="py-24 px-4 bg-gray-50">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center">
                <div className="flex-1">
                    {/* Abstract visual representation of dashboard */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 relative">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <div className="h-2 w-24 bg-gray-200 rounded mb-2"></div>
                                <div className="h-8 w-32 bg-gray-900 rounded"></div>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 rounded-full"></div>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50">
                                    <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                        {i === 1 ? <BookOpen size={16} /> : i === 2 ? <Users size={16} /> : <CheckCircle2 size={16} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="h-2 w-20 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-2 w-12 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="h-4 w-16 bg-blue-100 rounded text-blue-600 text-xs flex items-center justify-center font-bold">Active</div>
                                </div>
                            ))}
                        </div>

                        {/* Floating element */}
                        <div className="absolute -bottom-6 -right-6 bg-black text-white p-6 rounded-2xl shadow-lg">
                            <div className="text-xs text-gray-400 mb-1">Assignments Completed</div>
                            <div className="text-2xl font-bold">1,240+</div>
                            <div className="text-xs text-green-400 mt-1">This semester</div>
                        </div>
                    </div>
                </div>
                <div className="flex-1">
                    <h2 className="text-4xl font-bold mb-6 text-gray-900">How Aski Works</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Our streamlined process makes getting help simple and stress-free. Focus on learning while we handle the logistics.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mt-1">
                                <span className="font-bold">1</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-gray-900">Post Your Assignment</h4>
                                <p className="text-gray-500 text-sm">Share details about your project, deadline, and budget.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mt-1">
                                <span className="font-bold">2</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-gray-900">Choose a Tutor</h4>
                                <p className="text-gray-500 text-sm">Review bids and profiles to select the best match for you.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 mt-1">
                                <span className="font-bold">3</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-gray-900">Get Results</h4>
                                <p className="text-gray-500 text-sm">Receive your solution, review it, and release payment.</p>
                            </div>
                        </div>
                    </div>

                    <button className="mt-10 bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
                        Get Started Now <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </section>
    );
};
