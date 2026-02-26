// Server Component — no interactivity, no 'use client'
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function LandingNav() {
    return (
        <header className="w-full px-6 py-4">
            <nav className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-900 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">A</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">Aski</span>
                </div>

                {/* Navigation links */}
                <div className="hidden md:flex items-center space-x-8">
                    <div className="flex items-center space-x-1 cursor-pointer">
                        <div className="px-6 py-2 bg-white">
                            <span className="text-gray-900 font-medium">Home</span>
                        </div>
                        <div className="px-6 py-2 transition-colors">
                            <span className="text-gray-600 hover:text-gray-900 font-medium">Features</span>
                        </div>
                        <div className="px-6 py-2 transition-colors">
                            <span className="text-gray-600 hover:text-gray-900 font-medium">About Us</span>
                        </div>
                        <div className="px-6 py-2 transition-colors">
                            <span className="text-gray-600 hover:text-gray-900 font-medium">Contact</span>
                        </div>
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex items-center space-x-4">
                    <a href="/account/login?role=user" rel="noopener noreferrer">
                        <span className="text-gray-900 font-medium">Sign In</span>
                    </a>
                    <Link
                        href="/account/register"
                        className="flex items-center font-medium text-white space-x-2 px-10 py-2 bg-black border-2 shadow-xl rounded-xl transition-colors"
                    >
                        Join Us
                    </Link>
                    <Link
                        href="/account/register?role=tutor"
                        className="bg-primary-300 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center space-x-2"
                    >
                        <span>Register as Tutor</span>
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </nav>
        </header>
    )
}
