'use client'
import React from 'react'
import TutorProfileContent from '@/components/TutorProfileContent'

const PublicTutorProfilePage = () => {
    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            {/* Simple Header for public view */}
            <header className="bg-white border-b border-gray-100 py-4 px-6 fixed top-0 w-full z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <img src="/assets/main-logo.svg" alt="Aski" className="h-8" />
                    </div>
                    <a href="/login" className="text-sm font-medium text-purple-600 hover:text-purple-700">
                        Sign In
                    </a>
                </div>
            </header>

            <main className="pt-20">
                <TutorProfileContent />
            </main>
        </div>
    )
}

export default PublicTutorProfilePage
