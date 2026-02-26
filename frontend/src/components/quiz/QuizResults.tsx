"use client"
// QuizResults — summary panel shown after quiz completion
import { AlertCircle, Check, X } from "lucide-react"

interface QuizSummary {
    score: number
    totalQuestions: number
    answeredQuestions: number
    correctAnswers: number
    incorrectAnswers: number
    topicPerformance: Record<string, { total: number; correct: number }>
    timeSpent: number
}

interface Question {
    id: number
    question: string
    options: string[]
    correctAnswer: number
    topic: string
}

interface QuizResultsProps {
    summary: QuizSummary
    questions: Question[]
    answers: (number | undefined)[]
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
}

export function QuizResults({ summary, questions, answers }: QuizResultsProps) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Quiz Summary</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Performance overview */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Performance Overview</h3>
                    <div className="space-y-2">
                        {[
                            ["Score:", `${summary.score} / ${summary.totalQuestions}`],
                            ["Percentage:", `${Math.round((summary.score / summary.totalQuestions) * 100)}%`],
                            ["Questions Answered:", `${summary.answeredQuestions} / ${summary.totalQuestions}`],
                        ].map(([label, value]) => (
                            <div key={label} className="flex justify-between">
                                <span className="text-gray-600">{label}</span>
                                <span className="font-medium">{value}</span>
                            </div>
                        ))}
                        <div className="flex justify-between">
                            <span className="text-gray-600">Correct Answers:</span>
                            <span className="font-medium text-primary-300">{summary.correctAnswers}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Incorrect Answers:</span>
                            <span className="font-medium text-red-600">{summary.incorrectAnswers}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Time Spent:</span>
                            <span className="font-medium">{formatTime(summary.timeSpent)}</span>
                        </div>
                    </div>
                </div>

                {/* Topic performance */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Topic Performance</h3>
                    <div className="space-y-3">
                        {Object.entries(summary.topicPerformance).map(([topic, data]) => (
                            <div key={topic} className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{topic}</span>
                                    <span className="text-sm">{data.correct} / {data.total} ({Math.round((data.correct / data.total) * 100)}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${data.correct / data.total >= 0.7 ? "bg-primary-300" :
                                                data.correct / data.total >= 0.4 ? "bg-yellow-500" : "bg-red-500"
                                            }`}
                                        style={{ width: `${(data.correct / data.total) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Question analysis */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-3">Question Analysis</h3>
                <div className="space-y-4">
                    {questions.map((question, index) => (
                        <div key={index} className="border-b pb-3 last:border-b-0">
                            <div className="flex items-start">
                                <div className="mr-2 mt-1">
                                    {answers[index] === undefined ? (
                                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                                    ) : answers[index] === question.correctAnswer ? (
                                        <Check className="h-5 w-5 text-primary-300" />
                                    ) : (
                                        <X className="h-5 w-5 text-red-500" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium">Question {index + 1}: {question.question}</p>
                                    <div className="mt-1 text-sm">
                                        {answers[index] === undefined ? (
                                            <span className="text-yellow-600">Not answered</span>
                                        ) : answers[index] === question.correctAnswer ? (
                                            <span className="text-primary-300">Correct answer: {question.options[question.correctAnswer]}</span>
                                        ) : (
                                            <div className="text-red-600">
                                                <div>Your answer: {question.options[answers[index]!]}</div>
                                                <div>Correct answer: {question.options[question.correctAnswer]}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center">
                <p className="text-gray-600 mb-4">This summary has been saved for admin review. Thank you for completing the quiz.</p>
            </div>
        </div>
    )
}
