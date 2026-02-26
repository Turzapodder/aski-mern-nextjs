"use client"
// Quiz — thin orchestrator after split
// Sub-components: QuizQuestion, QuizProgress, QuizResults
import { useState, useEffect, useCallback } from "react"
import { QuizQuestion } from "./QuizQuestion"
import { QuizProgress } from "./QuizProgress"
import { QuizResults } from "./QuizResults"

const TOTAL_DURATION = 3600 // 60 minutes

interface QuizProps {
  subject: string
  topics: string[]
  questions: { id: number; question: string; options: string[]; correctAnswer: number; topic: string }[]
  onComplete: (quizSummary: any) => void
}

export default function Quiz({ subject, topics, questions, onComplete }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | undefined)[]>([])
  const [timeLeft, setTimeLeft] = useState(TOTAL_DURATION)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [quizSummary, setQuizSummary] = useState<any | null>(null)

  const handleSubmit = useCallback(() => {
    setQuizCompleted(true)
    const score = answers.reduce<number>((acc, answer, index) => acc + (answer === questions[index].correctAnswer ? 1 : 0), 0)
    const topicPerformance: Record<string, { total: number; correct: number }> = {}
    questions.forEach((q, i) => {
      if (!topicPerformance[q.topic]) topicPerformance[q.topic] = { total: 0, correct: 0 }
      topicPerformance[q.topic].total += 1
      if (answers[i] !== undefined && answers[i] === q.correctAnswer) topicPerformance[q.topic].correct += 1
    })
    const summary = {
      score, totalQuestions: questions.length,
      answeredQuestions: answers.filter((a) => a !== undefined).length,
      correctAnswers: score,
      incorrectAnswers: answers.filter((a, i) => a !== undefined && a !== questions[i].correctAnswer).length,
      topicPerformance, timeSpent: TOTAL_DURATION - timeLeft,
      answers: questions.map((q, i) => ({ questionId: q.id, question: q.question, options: q.options, selectedAnswer: answers[i] ?? null, correctAnswer: q.correctAnswer, topic: q.topic })),
    }
    setQuizSummary(summary); onComplete(summary)
  }, [answers, onComplete, questions, timeLeft])

  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted) {
      const timer = setInterval(() => setTimeLeft((p) => p - 1), 1000)
      return () => clearInterval(timer)
    } else if (timeLeft === 0) { handleSubmit() }
  }, [timeLeft, quizCompleted, handleSubmit])

  if (!questions || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">No questions available.</p>
      </div>
    )
  }

  if (quizCompleted && quizSummary) {
    return <QuizResults summary={quizSummary} questions={questions} answers={answers} />
  }

  return (
    <div className="flex mt-10">
      <QuizQuestion
        question={questions[currentQuestion]}
        questionIndex={currentQuestion}
        totalQuestions={questions.length}
        selectedAnswer={answers[currentQuestion]}
        onAnswer={(optionIndex) => {
          const updated = [...answers]
          updated[currentQuestion] = optionIndex
          setAnswers(updated)
        }}
        onPrev={() => setCurrentQuestion((p) => Math.max(0, p - 1))}
        onNext={() => setCurrentQuestion((p) => Math.min(questions.length - 1, p + 1))}
        onSubmit={handleSubmit}
      />
      <QuizProgress
        timeLeft={timeLeft}
        totalDuration={TOTAL_DURATION}
        questions={questions}
        currentQuestion={currentQuestion}
        answers={answers}
        onNavigate={setCurrentQuestion}
      />
    </div>
  )
}
