import React from "react";
import { SectionTitle } from "./LandingPageComponents";

export const TestimonialsSection = () => {
    const testimonials = [
        { name: "Alex Chen", role: "Computer Science Student", text: "Aski saved my semester! The tutor helped me debug my final project in record time." },
        { name: "Sarah Johnson", role: "Business Major", text: "I was struggling with accounting, but my tutor on Aski explained everything so clearly. Highly recommend!" },
        { name: "Michael Brown", role: "Engineering Student", text: "The platform is so easy to use. I posted my assignment and got great bids within minutes." }
    ];

    return (
        <section className="py-24 px-4 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <SectionTitle title="Student Success Stories" subtitle="Join thousands of students achieving their academic goals." />

                <div className="grid md:grid-cols-3 gap-6">
                    {testimonials.map((t, i) => (
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
    );
};
