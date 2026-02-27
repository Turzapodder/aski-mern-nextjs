import React from "react";
import Link from "next/link";

export const LandingNavbar = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
                        <span className="font-bold text-xl tracking-tight">Aski</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#" className="text-gray-600 hover:text-black font-medium text-sm">Find Tutors</Link>
                        <Link href="#" className="text-gray-600 hover:text-black font-medium text-sm">How it Works</Link>
                        <Link href="#" className="text-gray-600 hover:text-black font-medium text-sm">Success Stories</Link>
                        <Link href="#" className="text-gray-600 hover:text-black font-medium text-sm">Resources</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/account/login?role=user"
                            className="text-gray-900 hover:text-blue-600 font-medium text-sm transition-colors"
                        >
                            Log In
                        </Link>
                        <Link href="/account/register?role=user" className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-medium text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};
