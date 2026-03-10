import React from "react";
import Link from "next/link";
import { Zap, Globe, ShieldCheck, Users, ArrowRight } from "lucide-react";

export const AttractTutorsSection = () => {
    return (
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-blue-600 relative overflow-hidden rounded-2xl sm:rounded-[3rem] mx-4 my-8 sm:my-12">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-32 sm:w-64 h-32 sm:h-64 bg-white/10 rounded-full blur-2xl sm:blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-blue-400/20 rounded-full blur-2xl sm:blur-3xl translate-x-1/3 translate-y-1/3"></div>

            <div className="max-w-7xl mx-auto relative z-10 text-center text-white">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] sm:text-sm font-semibold mb-6 sm:mb-8">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                    Now Hiring Expert Tutors & Solvers
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight px-2">
                    Turn Your Knowledge <br className="hidden sm:block" />
                    <span className="text-blue-200">Into Income</span>
                </h2>

                <p className="text-lg sm:text-xl text-blue-100 mb-10 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
                    Join our community of elite educators and help students globally.
                    Flexible hours, competitive pay, and the tools you need to succeed.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16 text-left">
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 sm:p-6 rounded-2xl sm:rounded-3xl hover:bg-white/15 transition-colors group">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Zap className="text-yellow-400 w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <h4 className="font-bold text-base sm:text-lg mb-2">Instant Payments</h4>
                        <p className="text-blue-100 text-xs sm:text-sm">Get paid immediately after project completion and approval.</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 sm:p-6 rounded-2xl sm:rounded-3xl hover:bg-white/15 transition-colors group">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Globe className="text-green-400 w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <h4 className="font-bold text-base sm:text-lg mb-2">Global Impact</h4>
                        <p className="text-blue-100 text-xs sm:text-sm">Help students from top universities across the globe.</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 sm:p-6 rounded-2xl sm:rounded-3xl hover:bg-white/15 transition-colors group">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="text-blue-300 w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <h4 className="font-bold text-base sm:text-lg mb-2">Verified Experts</h4>
                        <p className="text-blue-100 text-xs sm:text-sm">Join a trusted network of high-quality professionals.</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 sm:p-6 rounded-2xl sm:rounded-3xl hover:bg-white/15 transition-colors group">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Users className="text-purple-300 w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <h4 className="font-bold text-base sm:text-lg mb-2">Expert Community</h4>
                        <p className="text-blue-100 text-xs sm:text-sm">Connect and grow with fellow tutors and subject experts.</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
                    <Link
                        href="/account/register?role=tutor"
                        className="w-full sm:w-auto bg-white text-blue-600 px-8 py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-blue-50 transition-all shadow-xl flex items-center justify-center gap-2 group"
                    >
                        Apply as a Tutor <ArrowRight className="group-hover:translate-x-1 transition-transform w-5 h-5" />
                    </Link>
                    <Link
                        href="#"
                        className="w-full sm:w-auto text-white border border-white/30 px-8 py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-white/10 transition-all flex justify-center"
                    >
                        Learn More
                    </Link>
                </div>

                <div className="mt-12 sm:mt-16 pt-8 border-t border-white/10 flex flex-wrap justify-center gap-6 sm:gap-12 opacity-80">
                    <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                        <span className="font-bold text-xl sm:text-2xl">500+</span>
                        <span className="text-[10px] sm:text-xs uppercase tracking-wider text-blue-100">Expert Solvers</span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                        <span className="font-bold text-xl sm:text-2xl">$250k+</span>
                        <span className="text-[10px] sm:text-xs uppercase tracking-wider text-blue-100">Paid to Tutors</span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                        <span className="font-bold text-xl sm:text-2xl">98%</span>
                        <span className="text-[10px] sm:text-xs uppercase tracking-wider text-blue-100">Satisfaction Rate</span>
                    </div>
                </div>
            </div>
        </section>
    );
};