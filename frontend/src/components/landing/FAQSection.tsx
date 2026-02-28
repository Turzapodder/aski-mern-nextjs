import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { SectionTitle } from "./LandingPageComponents";

const AccordionItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-100 py-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex justify-between items-center w-full text-left"
            >
                <span className="font-semibold text-gray-900">{question}</span>
                <span className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                </span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pt-4 text-gray-500 text-sm leading-relaxed">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export const FAQSection = () => {
    const faqs = [
        { q: "Is Aski safe to use?", a: "Yes, we prioritize your safety. Payments are held in escrow and released only when you're satisfied." },
        { q: "How do I choose the right tutor?", a: "You can review tutor profiles, ratings, and past reviews to make an informed decision." },
        { q: "What if I'm not satisfied with the work?", a: "We have a dispute resolution process. You can request revisions or a refund if requirements aren't met." },
        { q: "Is my personal information private?", a: "Absolutely. We strictly protect your data and privacy." }
    ];

    return (
        <section className="py-24 px-4 bg-gray-50">
            <div className="max-w-3xl mx-auto">
                <SectionTitle title="Frequently Asked Questions" />
                <div className="bg-white p-8 rounded-[2rem] shadow-sm">
                    {faqs.map((item, i) => (
                        <AccordionItem key={i} question={item.q} answer={item.a} />
                    ))}
                </div>
            </div>
        </section>
    );
};
