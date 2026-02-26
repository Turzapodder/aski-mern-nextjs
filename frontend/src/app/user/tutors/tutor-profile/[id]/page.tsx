import React, { Suspense } from 'react'
import { TutorProfileClient } from './TutorProfileClient'

export const metadata = {
  title: "Tutor Profile | Aski",
  description: "View tutor profile details",
};

export default function TutorProfilePage() {
  return (
    <Suspense fallback={<div className="mx-auto px-4 py-8 bg-[#FAFAFA] min-h-screen font-sans" />}>
      <TutorProfileClient />
    </Suspense>
  )
}
