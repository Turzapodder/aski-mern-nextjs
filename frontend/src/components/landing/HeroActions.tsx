"use client"
// Client island — only the interactive parts of the hero section.
// Keeps the parent HeroSection as a Server Component.

import { Send } from "lucide-react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import UploadProjectForm from "@/components/UploadProjectForm"

export function HeroActions() {
    const router = useRouter()

    const handleWhatsAppClick = () => {
        const isAuth = Cookies.get("is_auth")
        if (isAuth === "true") {
            window.open("https://wa.me/", "_blank")
        } else {
            router.push("/account/login?role=user&redirect=whatsapp")
        }
    }

    return (
        <div className="w-full max-w-md mx-auto flex flex-col items-center space-y-6">
            <button
                onClick={handleWhatsAppClick}
                className="group w-full flex items-center justify-center space-x-3 bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-[0_8px_30px_rgb(37,211,102,0.3)] hover:shadow-[0_8px_30px_rgb(37,211,102,0.5)] transform hover:-translate-y-1"
            >
                <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                <span>Send us your problem</span>
            </button>

            <div className="flex items-center space-x-3 w-full">
                <div className="h-px bg-gray-200 flex-1" />
                <span className="text-gray-400 font-medium text-sm uppercase tracking-wider">or upload manually</span>
                <div className="h-px bg-gray-200 flex-1" />
            </div>

            <UploadProjectForm
                maxWidth="max-w-3xl"
                onSubmit={(formData) => console.log("Form submitted:", formData)}
                onCancel={() => console.log("Form cancelled")}
                onSaveDraft={(formData) => console.log("Draft saved:", formData)}
                advanced={false}
            />
        </div>
    )
}
