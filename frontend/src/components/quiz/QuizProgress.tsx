"use client"
// QuizProgress — circular timer + question list sidebar
import { Check } from "lucide-react"

interface QuizProgressProps {
    timeLeft: number
    totalDuration: number
    questions: { id: number }[]
    currentQuestion: number
    answers: (number | undefined)[]
    onNavigate: (index: number) => void
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
}

export function QuizProgress({
    timeLeft,
    totalDuration,
    questions,
    currentQuestion,
    answers,
    onNavigate,
}: QuizProgressProps) {
    const timerProgress = (timeLeft / totalDuration) * 100
    const isTimeLow = timeLeft < 120
    const circumference = 2 * Math.PI * 45

    return (
        <div className="w-64 border-l pl-6">
            {/* Circular timer */}
            <div className="mb-6 flex flex-col items-center">
                <div className="relative w-20 h-20">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle className="text-gray-200" strokeWidth="8" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                        <circle
                            className={isTimeLow ? "text-red-500" : "text-primary-300"}
                            strokeWidth="8"
                            strokeDasharray={`${circumference}`}
                            strokeDashoffset={`${circumference * (1 - timerProgress / 100)}`}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="45"
                            cx="50"
                            cy="50"
                            transform="rotate(-90 50 50)"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-medium">{formatTime(timeLeft)}</span>
                    </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Timer Remaining</p>
            </div>

            {/* Question navigator */}
            <div>
                <h3 className="font-medium mb-3 flex items-center justify-between">
                    Quiz Questions List
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </h3>
                <div className="max-h-96 overflow-y-auto space-y-2 pr-[10px]">
                    {questions.map((_, index) => (
                        <div
                            key={index}
                            onClick={() => onNavigate(index)}
                            className={`p-3 rounded-full border flex items-center cursor-pointer ${currentQuestion === index
                                    ? "bg-white border-gray-300 font-medium"
                                    : answers[index] !== undefined
                                        ? "bg-primary-100 border-primary-200 text-primary-700"
                                        : "bg-gray-50 border-gray-200 text-gray-500"
                                }`}
                        >
                            <span className="mr-2">Question {index + 1}</span>
                            {answers[index] !== undefined && (
                                <div className="ml-auto">
                                    <div className="w-4 h-4 rounded-full bg-primary-300 flex items-center justify-center">
                                        <Check className="h-3 w-3 text-white" />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
