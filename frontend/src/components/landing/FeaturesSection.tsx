// Server Component — fully static, no interactivity required
export function FeaturesSection() {
    const features = [
        {
            step: 1,
            title: "Upload Your Assignment",
            description:
                "Easily submit your assignments with our intuitive upload system. Track progress, get feedback, and manage deadlines all in one place.",
            mockup: (
                <div className="bg-primary-100 text-primary-700 p-4 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-primary-300 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">✓</span>
                        </div>
                        <span className="text-sm">Submitted Successfully</span>
                    </div>
                    <div className="text-lg font-bold">Math Assignment #3</div>
                    <div className="text-sm opacity-80">Due: Tomorrow 11:59 PM</div>
                </div>
            ),
        },
        {
            step: 2,
            title: "Find Your Perfect Tutors",
            description:
                "Connect with expert tutors from around the world. Browse profiles, read reviews, and find the perfect match for your learning needs.",
            mockup: (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <span className="text-primary-600 text-lg">👨‍🏫</span>
                    </div>
                    <div className="flex-1">
                        <div className="font-medium text-gray-900">Dr. Sarah Johnson</div>
                        <div className="text-sm text-gray-500">PhD Mathematics • 5+ years • ⭐ 4.9</div>
                    </div>
                    <div className="font-bold text-gray-900">$25/hr</div>
                </div>
            ),
        },
        {
            step: 3,
            title: "Learn from the Best",
            description:
                "Access premium courses and learning materials from top educators. Track your progress and achieve your academic goals with expert guidance.",
            mockup: (
                <div className="bg-secondary-200 text-gray-900 px-4 py-2 rounded-lg inline-flex items-center space-x-2">
                    <span className="text-sm font-medium">85% Complete</span>
                    <div className="w-4 h-4 bg-gray-900 rounded flex items-center justify-center">
                        <span className="text-white text-xs">📈</span>
                    </div>
                </div>
            ),
        },
    ]

    return (
        <section className="px-6 py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full mb-6">
                        <div className="w-4 h-4 bg-secondary-300 rounded-full" />
                        <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">LEARNING PLATFORM</span>
                    </div>
                    <h2 className="text-5xl font-normal text-gray-900 mb-6 leading-tight">
                        Everything you need to excel in
                        <br />
                        your{" "}
                        <span className="inline-flex items-center bg-secondary-100 px-3 py-1 rounded-lg">📚</span>{" "}
                        academic journey
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {features.map(({ step, title, description, mockup }) => (
                        <div key={step} className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0">
                                    {step}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-medium text-gray-900 mb-3">{title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{description}</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <div className="space-y-4">{mockup}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
