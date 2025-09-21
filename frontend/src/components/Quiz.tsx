'use client';

import { useState, useEffect } from 'react';
import { Clock, Check, X, AlertCircle } from 'lucide-react';

interface QuizProps {
  subject: string;
  topics: string[];
  questions: {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    topic: string;
  }[];
  onComplete: (quizSummary: any) => void;
}

export default function Quiz({ subject, topics, questions, onComplete }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizSummary, setQuizSummary] = useState<{
    score: number;
    totalQuestions: number;
    answeredQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    topicPerformance: Record<string, { total: number; correct: number }>;
    timeSpent: number;
  } | null>(null);

  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft, quizCompleted]);

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    setQuizCompleted(true);
    
    // Calculate score
    const score = answers.reduce((acc, answer, index) => {
      return acc + (answer === questions[index].correctAnswer ? 1 : 0);
    }, 0);
    
    // Calculate topic performance
    const topicPerformance: Record<string, { total: number; correct: number }> = {};
    
    questions.forEach((question, index) => {
      const topic = question.topic;
      if (!topicPerformance[topic]) {
        topicPerformance[topic] = { total: 0, correct: 0 };
      }
      
      topicPerformance[topic].total += 1;
      
      if (answers[index] !== undefined && answers[index] === question.correctAnswer) {
        topicPerformance[topic].correct += 1;
      }
    });
    
    // Generate detailed answers array with questions and options
    const detailedAnswers = questions.map((question, index) => ({
      questionId: question.id,
      question: question.question,
      options: question.options,
      selectedAnswer: answers[index] !== undefined ? answers[index] : null,
      correctAnswer: question.correctAnswer,
      topic: question.topic
    }));

    // Generate summary
    const summary = {
      score,
      totalQuestions: questions.length,
      answeredQuestions: answers.filter(a => a !== undefined).length,
      correctAnswers: score,
      incorrectAnswers: answers.filter((a, i) => a !== undefined && a !== questions[i].correctAnswer).length,
      topicPerformance,
      timeSpent: 3600 - timeLeft,
      answers: detailedAnswers
    };
    
    setQuizSummary(summary);
    console.log('Generated quiz summary:', summary);
    
    // Call the onComplete callback with the summary object directly
    onComplete(summary);
  };

  const handleNavigation = (index: number) => {
    setCurrentQuestion(index);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate timer progress percentage
  const timerProgress = (timeLeft / 3600) * 100;
  const isTimeLow = timeLeft < 120; // Less than 2 minutes

  if (!questions || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">No questions available.</p>
      </div>
    );
  }

  // Show quiz summary if completed
  if (quizCompleted && quizSummary) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Quiz Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Performance Overview</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Score:</span>
                <span className="font-medium">{quizSummary.score} / {quizSummary.totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Percentage:</span>
                <span className="font-medium">
                  {Math.round((quizSummary.score / quizSummary.totalQuestions) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Questions Answered:</span>
                <span className="font-medium">{quizSummary.answeredQuestions} / {quizSummary.totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Correct Answers:</span>
                <span className="font-medium text-primary-300">{quizSummary.correctAnswers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Incorrect Answers:</span>
                <span className="font-medium text-red-600">{quizSummary.incorrectAnswers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time Spent:</span>
                <span className="font-medium">{formatTime(quizSummary.timeSpent)}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Topic Performance</h3>
            <div className="space-y-3">
              {Object.entries(quizSummary.topicPerformance).map(([topic, data]) => (
                <div key={topic} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{topic}</span>
                    <span className="text-sm">
                      {data.correct} / {data.total} ({Math.round((data.correct / data.total) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        (data.correct / data.total) >= 0.7 ? 'bg-primary-300' : 
                        (data.correct / data.total) >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(data.correct / data.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
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
                          <div>Your answer: {question.options[answers[index]]}</div>
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
          <p className="text-gray-600 mb-4">
            This summary has been saved for admin review. Thank you for completing the quiz.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex mt-10">
      <div className="flex-1 pr-6 space-y-6 w-[550px] flex flex-col justify-between">
        <div className='mt-10'>
        <h2 className="text-xl font-semibold">{questions[currentQuestion].question}</h2>

        <div className="space-y-3 mt-4">
          {questions[currentQuestion].options.map((option, index) => (
            <div
              key={index}
              onClick={() => handleAnswer(index)}
              className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                answers[currentQuestion] === index
                  ? 'border-primary-300'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <span className={`w-8 h-8 flex items-center justify-center rounded-md mr-3 ${
                  answers[currentQuestion] === index ? 'bg-primary-100' : 'bg-gray-100'
                }`}>
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </div>
              {answers[currentQuestion] === index && (
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
            <button
              onClick={() => handleNavigation(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="px-6 py-2 rounded-full bg-gray-100 text-gray-600 disabled:opacity-50"
              type="button"
            >
              Previous
            </button>
            <button
              onClick={() => handleNavigation(currentQuestion + 1)}
              disabled={currentQuestion === questions.length - 1}
              className={`px-6 py-2 rounded-full ${currentQuestion===questions.length-1? 'bg-gray-100 text-gray-600': 'bg-primary-300 text-white'}  disabled:opacity-50`}
              type="button"
            >
              Next
            </button>
          </div>
          
          {currentQuestion === questions.length - 1 && (
            <button
              onClick={handleSubmit}
              className="w-full px-6 py-2 rounded-full bg-primary-300 text-white"
              type="button"
            >
              Submit Answer
            </button>
          )}
        </div>
      </div>

      <div className="w-64 border-l pl-6">
        <div className="mb-6 flex flex-col items-center">
          <div className="relative w-20 h-20">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-gray-200"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="45"
                cx="50"
                cy="50"
              />
              <circle
                className={`${isTimeLow ? 'text-red-500' : 'text-primary-300'}`}
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - timerProgress / 100)}`}
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

        <div>
          <h3 className="font-medium mb-3 flex items-center justify-between">
            Quiz Questions List
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </h3>
          <div className="max-h-96 overflow-y-auto space-y-2 pr-[10px]">
            {questions.map((_, index) => (
              <div
                key={index}
                onClick={() => handleNavigation(index)}
                className={`p-3 rounded-full border flex items-center cursor-pointer ${
                  currentQuestion === index 
                    ? 'bg-white border-gray-300 font-medium' 
                    : answers[index] !== undefined
                      ? 'bg-primary-100 border-primary-200 text-primary-700'
                      : 'bg-gray-50 border-gray-200 text-gray-500'
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
    </div>
  );
}