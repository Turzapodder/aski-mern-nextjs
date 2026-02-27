"use client";

import React from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { UnlockPotentialSection } from "@/components/landing/UnlockPotentialSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { AttractTutorsSection } from "@/components/landing/AttractTutorsSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const LandingClient = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      <LandingNavbar />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <UnlockPotentialSection />
        <FAQSection />
        <TestimonialsSection />
        <AttractTutorsSection />
      </main>
      <LandingFooter />
    </div>
  );
};
