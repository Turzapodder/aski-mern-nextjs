import Quiz from '@/components/Quiz';
import { Skeleton } from '@/components/ui/skeleton';
import type { QuizQuestion, QuizSummary } from './types';

interface QuizStepProps {
  isSubmitting: boolean;
  applicationSubmitted: boolean;
  quizLoading: boolean;
  quizQuestions: QuizQuestion[];
  subject: string;
  topics: string[];
  onComplete: (summary: QuizSummary) => void;
}

export function QuizStep({
  isSubmitting,
  applicationSubmitted,
  quizLoading,
  quizQuestions,
  subject,
  topics,
  onComplete,
}: QuizStepProps) {
  if (quizLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-4 w-52" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isSubmitting && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-center">
          Submitting your application... Please wait.
        </div>
      )}
      <Quiz
        subject={subject}
        topics={topics}
        questions={quizQuestions}
        onComplete={(summary: QuizSummary) => {
          if (!isSubmitting && !applicationSubmitted) {
            onComplete(summary);
          }
        }}
      />
    </div>
  );
}
