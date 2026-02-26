// Server Component — no 'use client'
// Each section below is also a Server Component except HeroActions (client island inside HeroSection)
import type { Metadata } from "next"
import { LandingNav } from "@/components/landing/LandingNav"
import { HeroSection } from "@/components/landing/HeroSection"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { JoinSection } from "@/components/landing/JoinSection"
import { LandingFooter } from "@/components/landing/LandingFooter"

export const metadata: Metadata = {
  title: "Aski — Learn from Expert Tutors",
  description:
    "Aski connects students with expert tutors. Submit assignments, find tutors, and track your academic progress — all in one platform.",
  openGraph: {
    title: "Aski — Learn from Expert Tutors",
    description: "Submit assignments, find tutors, and track your academic progress.",
    type: "website",
  },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <JoinSection />
      <LandingFooter />
    </div>
  )
}
