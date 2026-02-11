"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    CheckCircle2,
    Globe,
    Zap,
    ShieldCheck,
    LayoutDashboard,
    BarChart3,
    Users,
    MessageSquare,
    Plus,
    Minus,
    GraduationCap,
    BookOpen,
    Clock
} from "lucide-react";
import UploadProjectForm from "@/components/UploadProjectForm";
import { FeatureCard, SectionTitle } from "@/components/landing-backup/LandingPageComponents";
import { motion } from "framer-motion";

const AccordionItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-100 py-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex justify-between items-center w-full text-left"
            >
                <span className="font-semibold text-gray-900">{question}</span>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                </button>
            </button>
            <motion.div
                initial={false}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                className="overflow-hidden"
            >
                <p className="pt-4 text-gray-500 text-sm leading-relaxed">
                    {answer}
                </p>
            </motion.div>
        </div>
    )
}

export default function LandingBackupPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">

            {/* Navbar */}
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
                            <button className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-medium text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
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

            {/* Stats/Universities Section */}
            <section className="py-10 border-y border-gray-50 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {/* Placeholder logos */}
                    {['Harvard', 'MIT', 'Stanford', 'Oxford', 'Cambridge'].map(brand => (
                        <span key={brand} className="text-xl font-bold font-serif">{brand}</span>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <SectionTitle
                        title="Why Choose Aski?"
                        subtitle="Powerful tools designed to help you excel in your studies."
                    />

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<GraduationCap className="text-blue-600" />}
                            title="Expert Tutors"
                            description="Get help from verified experts in every subject, from Mathematics to Computer Science."
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="text-orange-500" />}
                            title="Secure Payments"
                            description="Your money is held in escrow and only released when you are 100% satisfied with the work."
                        />
                        <FeatureCard
                            icon={<Clock className="text-purple-600" />}
                            title="24/7 Support"
                            description="We're here for you anytime, day or night, to ensure you meet your deadlines."
                        />
                    </div>
                </div>
            </section>

            {/* How it works */}
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

            {/* Unlock Your Potential */}
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

            {/* FAQ */}
            <section className="py-24 px-4 bg-gray-50">
                <div className="max-w-3xl mx-auto">
                    <SectionTitle title="Frequently Asked Questions" />
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm">
                        {[
                            { q: "Is Aski safe to use?", a: "Yes, we prioritize your safety. Payments are held in escrow and released only when you're satisfied." },
                            { q: "How do I choose the right tutor?", a: "You can review tutor profiles, ratings, and past reviews to make an informed decision." },
                            { q: "What if I'm not satisfied with the work?", a: "We have a dispute resolution process. You can request revisions or a refund if requirements aren't met." },
                            { q: "Is my personal information private?", a: "Absolutely. We strictly protect your data and privacy." }
                        ].map((item, i) => (
                            <AccordionItem key={i} question={item.q} answer={item.a} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 px-4 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <SectionTitle title="Student Success Stories" subtitle="Join thousands of students achieving their academic goals." />

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { name: "Alex Chen", role: "Computer Science Student", text: "Aski saved my semester! The tutor helped me debug my final project in record time." },
                            { name: "Sarah Johnson", role: "Business Major", text: "I was struggling with accounting, but my tutor on Aski explained everything so clearly. Highly recommend!" },
                            { name: "Michael Brown", role: "Engineering Student", text: "The platform is so easy to use. I posted my assignment and got great bids within minutes." }
                        ].map((t, i) => (
                            <div key={i} className="p-6 bg-yellow-50/50 rounded-2xl border border-yellow-100">
                                <div className="flex text-yellow-400 mb-4 text-sm">★★★★★</div>
                                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                                    &quot;{t.text}&quot;
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">{t.name[0]}</div>
                                    <div>
                                        <div className="font-bold text-sm text-gray-900">{t.name}</div>
                                        <div className="text-xs text-gray-500">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
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
        </div>
    );
}
