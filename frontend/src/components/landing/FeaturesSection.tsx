import React from 'react';
import { GraduationCap, ShieldCheck, Clock } from "lucide-react";
import { FeatureCard, SectionTitle } from "./LandingPageComponents";

export const FeaturesSection = () => {
    return (
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
    );
};
