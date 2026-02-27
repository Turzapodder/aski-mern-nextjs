import React from "react";
import UploadProjectForm from "@/components/UploadProjectForm";

export const HeroSection = () => {
    return (
        <section className="pt-32 pb-20 px-4 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/4"></div>
            <div className="absolute top-20 left-0 w-[400px] h-[400px] bg-blue-100/50 rounded-full blur-[80px] -z-10 -translate-x-1/3"></div>

            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mb-6 border border-blue-100">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        Join 10,000+ Students Today
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] mb-6 tracking-tight">
                        Master Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Academic Journey</span> <br />
                        with Expert Guidance
                    </h1>
                    <p className="text-xl text-gray-500 mb-8 leading-relaxed max-w-lg">
                        Connect with top-rated tutors for personalized assignment help, project support, and 1-on-1 learning.
                    </p>

                    <div className="flex items-center gap-2 p-1.5 bg-white border border-gray-200 rounded-full max-w-md shadow-sm mb-10">
                        <input
                            type="text"
                            placeholder="What subject do you need help with?"
                            className="flex-1 px-4 py-2 bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
                        />
                        <button className="bg-black text-white px-6 py-2.5 rounded-full font-medium hover:bg-gray-800 transition-colors">
                            Find Tutors
                        </button>
                    </div>

                    <div className="flex gap-8 items-center text-sm">
                        <div>
                            <h4 className="font-bold text-2xl">10k+</h4>
                            <p className="text-gray-500">Active Students</p>
                        </div>
                        <div className="h-8 w-px bg-gray-200"></div>
                        <div>
                            <h4 className="font-bold text-2xl">4.9</h4>
                            <div className="flex text-yellow-400 text-xs mt-1">★★★★★</div>
                            <p className="text-gray-500 mt-1">Student Satisfaction</p>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    {/* Component Injection */}
                    <div className="relative z-10 transform scale-[0.85] origin-top-right lg:scale-100">
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                            <UploadProjectForm />
                        </div>
                    </div>

                    {/* Decorative elements behind the form */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-[2rem] blur-xl -z-10"></div>
                </div>
            </div>
        </section>
    );
};
