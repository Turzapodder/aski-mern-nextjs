// Server Component — fully static footer
export function LandingFooter() {
    const quickLinks = ["Home", "About Us", "Features", "Contact"]
    const supportLinks = ["Help Center", "Privacy Policy", "Terms of Service", "FAQ"]

    return (
        <footer className="px-6 py-12 bg-primary-600">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Logo & tagline */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary-300 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">A</span>
                            </div>
                            <span className="text-xl font-bold text-white">Aski</span>
                        </div>
                        <p className="text-white text-sm leading-relaxed">
                            The best place to learn with interactive activities and expert guidance.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-white font-semibold">Quick Links</h3>
                        <div className="space-y-2">
                            {quickLinks.map((link) => (
                                <a key={link} href="#" className="block text-white hover:text-white transition-colors">
                                    {link}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Support */}
                    <div className="space-y-4">
                        <h3 className="text-white font-semibold">Support</h3>
                        <div className="space-y-2">
                            {supportLinks.map((link) => (
                                <a key={link} href="#" className="block text-white hover:text-white transition-colors">
                                    {link}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h3 className="text-white font-semibold">Contact</h3>
                        <div className="space-y-2 text-white text-sm">
                            <p>hello@aski.com</p>
                            <p>+1 (555) 123-4567</p>
                            <p>
                                123 Learning Street
                                <br />
                                Education City, EC 12345
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-white text-sm">© 2024 Aski. All rights reserved.</p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            {["Facebook", "Twitter", "Instagram"].map((name) => (
                                <a key={name} href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <span className="sr-only">{name}</span>
                                    <div className="w-6 h-6 bg-gray-600 rounded" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
