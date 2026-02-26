// Server Component — static content, fully SSR-friendly
import { Sparkles } from "lucide-react"
import { HeroActions } from "./HeroActions"


export function HeroSection() {
    return (
        <section className="relative px-6 py-16 overflow-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 gap-12 items-center relative z-10 bg-[url('/assets/bg-image.png')] bg-cover bg-center bg-no-repeat">
                <div className="space-y-8 flex items-center justify-center flex-col">
                    {/* Badge */}
                    <a href="#_" className="relative inline-block text-lg group">
                        <span className="relative z-10 block px-5 py-3 overflow-hidden font-medium leading-tight text-gray-800 transition-colors duration-300 ease-out border-2 border-gray-900 rounded-lg group-hover:text-white">
                            <span className="absolute inset-0 w-full h-full px-5 py-3 rounded-lg bg-primary-600" />
                            <span className="absolute left-0 w-48 h-48 -ml-2 transition-all duration-300 origin-top-right -rotate-90 -translate-x-full translate-y-12 bg-gray-900 group-hover:-rotate-180 ease" />
                            <span className="relative flex flex-row-reverse gap-2 items-center text-white">
                                Welcome to Aski
                                <Sparkles />
                            </span>
                        </span>
                        <span
                            className="absolute bottom-0 right-0 w-full h-12 -mb-1 -mr-1 transition-all duration-200 ease-linear bg-gray-900 rounded-lg group-hover:mb-0 group-hover:mr-0"
                            data-rounded="rounded-lg"
                        />
                    </a>

                    {/* Headline */}
                    <div className="space-y-6">
                        <h1 className="text-5xl lg:text-6xl font-smibold text-gray-900 leading-tight text-center">
                            The best place to learn
                            <span className="block text-primary-300 font-cursive">not from Ai</span>
                        </h1>
                        <p className="text-md text-gray-600 leading-relaxed text-center">
                            Discover thousands of fun and interactive learning activities to
                            support your child&apos;s growth and learning process.
                        </p>
                    </div>

                    {/* Client island — WhatsApp button + upload form need interactivity */}
                    <HeroActions />
                </div>
            </div>
        </section>
    )
}
