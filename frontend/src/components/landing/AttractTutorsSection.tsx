import React from "react";
import Link from "next/link";
import { Zap, Globe, ShieldCheck, Users, ArrowRight } from "lucide-react";
import { SectionTitle } from "./LandingPageComponents";

export const AttractTutorsSection = () => {
    return (
        <section className="py-24 px-4 bg-blue-600 relative overflow-hidden rounded-[3rem] mx-4 my-12">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

            <div className="max-w-7xl mx-auto relative z-10 text-center text-white">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-semibold mb-8">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                    Now Hiring Expert Tutors & Solvers
                </div>

                <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                    Turn Your Knowledge <br />
                    <span className="text-blue-200">Into Income</span>
                </h2>

                <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
                    Join our community of elite educators and help students globally.
                    Flexible hours, competitive pay, and the tools you need to succeed.
                </p>

                <div className="grid md:grid-cols-4 gap-6 mb-16 text-left">
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-3xl hover:bg-white/15 transition-colors group">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Zap className="text-yellow-400" />
                        </div>
                        <h4 className="font-bold text-lg mb-2">Instant Payments</h4>
                        <p className="text-blue-100 text-sm">Get paid immediately after project completion and approval.</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-3xl hover:bg-white/15 transition-colors group">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Globe className="text-green-400" />
                        </div>
                        <h4 className="font-bold text-lg mb-2">Global Impact</h4>
                        <p className="text-blue-100 text-sm">Help students from top universities across the globe.</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-3xl hover:bg-white/15 transition-colors group">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="text-blue-300" />
                        </div>
                        <h4 className="font-bold text-lg mb-2">Verified Experts</h4>
                        <p className="text-blue-100 text-sm">Join a trusted network of high-quality professionals.</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-3xl hover:bg-white/15 transition-colors group">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Users className="text-purple-300" />
                        </div>
                        <h4 className="font-bold text-lg mb-2">Expert Community</h4>
                        <p className="text-blue-100 text-sm">Connect and grow with fellow tutors and subject experts.</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link
                        href="/account/register?role=tutor"
                        className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-all shadow-xl flex items-center gap-2 group"
                    >
                        Apply as a Tutor <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="#"
                        className="text-white border border-white/30 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all"
                    >
                        Learn More
                    </Link>
                </div>

                <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap justify-center gap-8 opacity-60">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-2xl">500+</span>
                        <span className="text-xs uppercase tracking-wider">Expert Solvers</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-2xl">$250k+</span>
                        <span className="text-xs uppercase tracking-wider">Paid to Tutors</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-2xl">98%</span>
                        <span className="text-xs uppercase tracking-wider">Satisfaction Rate</span>
                    </div>
                </div>
            </div>
        </section>
    );
};
