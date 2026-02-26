"use client"
// QuizQuestion — individual question + option list
import { Check } from "lucide-react"

interface Question {
    id: number
    question: string
    options: string[]
    correctAnswer: number
    topic: string
}

interface QuizQuestionProps {
    question: Question
    questionIndex: number
    totalQuestions: number
    selectedAnswer: number | undefined
    onAnswer: (optionIndex: number) => void
    onPrev: () => void
    onNext: () => void
    onSubmit: () => void
}

export function QuizQuestion({
    question,
    questionIndex,
    totalQuestions,
    selectedAnswer,
    onAnswer,
    onPrev,
    onNext,
    onSubmit,
}: QuizQuestionProps) {
    return (
        <div className="flex-1 pr-6 space-y-6 w-[550px] flex flex-col justify-between">
            <div className="mt-10">
                <h2 className="text-xl font-semibold">{question.question}</h2>

                <div className="space-y-3 mt-4">
                    {question.options.map((option, index) => (
                        <div
                            key={index}
                            onClick={() => onAnswer(index)}
                            className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${selectedAnswer === index ? "border-primary-300" : "border-gray-200 hover:border-gray-300"
                                }`}
                        >
                            <div className="flex items-center">
                                <span className={`w-8 h-8 flex items-center justify-center rounded-md mr-3 ${selectedAnswer === index ? "bg-primary-100" : "bg-gray-100"}`}>
                                    {String.fromCharCode(65 + index)}
                                </span>
                                {option}
                            </div>
                            {selectedAnswer === index && (
                                <div className="w-4 h-4 rounded-full bg-primary-300 flex items-center justify-center">
                                    <Check className="h-3 w-3 text-white" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col space-y-3 mt-6">
                <div className="flex justify-between items-center">
                    <button onClick={onPrev} disabled={questionIndex === 0} type="button" className="px-6 py-2 rounded-full bg-gray-100 text-gray-600 disabled:opacity-50">
                        Previous
                    </button>
                    <button
                        onClick={onNext}
                        disabled={questionIndex === totalQuestions - 1}
                        type="button"
                        className={`px-6 py-2 rounded-full ${questionIndex === totalQuestions - 1 ? "bg-gray-100 text-gray-600" : "bg-primary-300 text-white"} disabled:opacity-50`}
                    >
                        Next
                    </button>
                </div>
                {questionIndex === totalQuestions - 1 && (
                    <button onClick={onSubmit} type="button" className="w-full px-6 py-2 rounded-full bg-primary-300 text-white">
                        Submit Answer
                    </button>
                )}
            </div>
        </div>
    )
}
