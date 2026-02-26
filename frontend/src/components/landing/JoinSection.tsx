// Server Component — fully static
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function JoinSection() {
    return (
        <section className="px-6 py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
                        {/* Left Content */}
                        <div className="p-12 flex flex-col justify-center">
                            <h2 className="text-4xl font-bold text-gray-900 mb-6">
                                Get in touch
                                <br />
                                with us
                            </h2>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                We&apos;re here to help! Whether you have a question about our tutoring services,
                                need assistance with your account, or want to join our team of expert tutors,
                                we&apos;re ready to assist you.
                            </p>
                            <div className="space-y-6 mb-8">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Email:</h3>
                                    <p className="text-gray-700">hello@aski.com</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Phone:</h3>
                                    <p className="text-gray-700">+1 234 567 78</p>
                                    <p className="text-sm text-gray-500">Available Monday to Friday, 9 AM - 6 PM GMT</p>
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <button className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                    <span>Live Chat</span>
                                    <ArrowRight size={16} />
                                </button>
                                <Link
                                    href="/account/register?role=tutor"
                                    className="bg-primary-300 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center space-x-2"
                                >
                                    <span>Register as Tutor</span>
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>

                        {/* Right Visual */}
                        <div className="bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center p-12">
                            <div className="text-center">
                                <div className="w-48 h-48 bg-white rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                                    <div className="text-6xl">👨‍🏫</div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Join Our Team</h3>
                                <p className="text-gray-600 max-w-sm">
                                    Become part of our community of expert tutors and help students achieve their academic goals.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
