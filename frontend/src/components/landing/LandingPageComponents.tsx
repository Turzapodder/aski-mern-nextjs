import { ReactNode } from 'react';
import { LucideIcon, Check } from 'lucide-react';

interface FeatureCardProps {
    icon: ReactNode;
    title: string;
    description: string;
}

export const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
        <div className="p-3 bg-gray-50 rounded-xl">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
);

interface PricingCardProps {
    title: string;
    price: string;
    period: string;
    features: string[];
    isPopular?: boolean;
    buttonText?: string;
}

export const PricingCard = ({ title, price, period, features, isPopular = false, buttonText = "Get Started" }: PricingCardProps) => (
    <div className={`p-8 rounded-[2rem] border ${isPopular ? 'border-blue-600 bg-blue-50/5 ring-4 ring-blue-600/10' : 'border-gray-100 bg-white'} relative flex flex-col h-full`}>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <div className="mb-6">
            <span className="text-4xl font-bold text-gray-900">{price}</span>
            <span className="text-gray-500 text-sm">{period}</span>
        </div>

        <div className="flex-grow space-y-4 mb-8">
            {features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                    <div className="mt-1 p-0.5 rounded-full bg-blue-100 text-blue-600">
                        <Check size={12} strokeWidth={3} />
                    </div>
                    {feature}
                </div>
            ))}
        </div>

        <button className={`w-full py-3 rounded-xl font-medium transition-colors ${isPopular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
            {buttonText}
        </button>
    </div>
);

export const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div className="text-center mb-16 max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
        {subtitle && <p className="text-gray-500">{subtitle}</p>}
    </div>
);
