import React, { Suspense } from 'react'
import TutorComponent from '@/components/TutorComponent'

export const metadata = {
  title: "Tutors | Aski",
  description: "Browse and find tutors",
};

const TutorsPage = () => {
  return (
    <div className="min-h-screen bg-[#f6f6f6] p-6">
      <Suspense fallback={<div>Loading tutors...</div>}>
        <TutorComponent/>
      </Suspense>
    </div>
  )
}

export default TutorsPage
