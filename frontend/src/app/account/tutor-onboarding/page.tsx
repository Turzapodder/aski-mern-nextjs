import React, { Suspense } from "react";
import { TutorOnboardingClient } from "./TutorOnboardingClient";

export const metadata = {
  title: "Tutor Onboarding | Aski",
  description: "Apply to become a tutor",
};

export default function TutorOnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100" />}>
      <TutorOnboardingClient />
    </Suspense>
  );
}
