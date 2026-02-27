import React from "react";
import Link from "next/link";

export const LandingFooter = () => {
    return (
        <footer className="bg-black text-white pt-20 pb-10 px-4 rounded-t-[3rem] mt-20">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
                    <div className="max-w-sm">
                        <h2 className="text-2xl font-bold mb-6">Join Aski and excel in your studies today.</h2>
                        <div className="flex items-center gap-2 bg-gray-900 p-1.5 rounded-full border border-gray-800">
                            <input type="email" placeholder="Enter your email" className="bg-transparent px-4 text-sm outline-none w-full" />
                            <button className="bg-white text-black rounded-full px-6 py-2 text-sm font-bold whitespace-nowrap">Join Now</button>
                        </div>
                    </div>

                    <div className="flex gap-16 text-sm text-gray-400">
                        <div className="space-y-4">
                            <h4 className="text-white font-bold">Platform</h4>
                            <Link href="#" className="block hover:text-white">Find Tutors</Link>
                            <Link href="#" className="block hover:text-white">Post Assignment</Link>
                            <Link href="#" className="block hover:text-white">How it Works</Link>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-white font-bold">Company</h4>
                            <Link href="#" className="block hover:text-white">About Us</Link>
                            <Link href="#" className="block hover:text-white">Careers</Link>
                            <Link href="#" className="block hover:text-white">Blog</Link>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-white font-bold">Support</h4>
                            <Link href="#" className="block hover:text-white">Help Center</Link>
                            <Link href="#" className="block hover:text-white">Contact Us</Link>
                            <Link href="#" className="block hover:text-white">Terms of Service</Link>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-900 text-xs text-gray-500">
                    <div>
                        <div className="flex items-center gap-2 mb-2 md:mb-0">
                            <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center text-white font-serif font-bold">A</div>
                            <span className="text-white font-bold">Aski</span>
                        </div>
                    </div>
                    <div>
                        © 2024 Aski Inc. All rights reserved.
                    </div>
                    <div className="flex gap-4">
                        <Link href="#" className="hover:text-white">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
