'use client';

import React from 'react';
import { LandingNavbar } from '@/features/Landing/components/landing/LandingNavbar';
import { HeroSection } from '@/features/Landing/components/landing/HeroSection';
import { StatsSection } from '@/features/Landing/components/landing/StatsSection';
import { FeaturesSection } from '@/features/Landing/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/features/Landing/components/landing/HowItWorksSection';
import { UnlockPotentialSection } from '@/features/Landing/components/landing/UnlockPotentialSection';
import { FAQSection } from '@/features/Landing/components/landing/FAQSection';
import { TestimonialsSection } from '@/features/Landing/components/landing/TestimonialsSection';
import { AttractTutorsSection } from '@/features/Landing/components/landing/AttractTutorsSection';
import { LandingFooter } from '@/features/Landing/components/landing/LandingFooter';

export const LandingClient = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      <LandingNavbar />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <div id="how-it-works" className="scroll-mt-24">
          <HowItWorksSection />
        </div>
        <UnlockPotentialSection />
        <div id="resources" className="scroll-mt-24">
          <FAQSection />
        </div>
        <div id="success-stories" className="scroll-mt-24">
          <TestimonialsSection />
        </div>
        <AttractTutorsSection />
      </main>
      <LandingFooter />
    </div>
  );
};
