'use client';

import { StepSidebar } from './StepSidebar';
import { PersonalInfoStep } from './PersonalInfoStep';
import { QuizStep } from './QuizStep';
import { ApprovalSummaryStep } from './ApprovalSummaryStep';
import { useTutorOnboardingLogic } from './hooks/useTutorOnboardingLogic';
import { STEPS } from './steps';
import type { QuizSummary } from './types';

export const TutorOnboardingClient = () => {
  const {
    formik,
    currentStep,
    isSubmitting,
    quizQuestions,
    quizLoading,
    countdown,
    showSubmit,
    applicationSubmitted,
    errorMessage,
    setErrorMessage,
    existingApplication,
    handleFinalSubmit,
  } = useTutorOnboardingLogic();

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            formik={formik}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
          />
        );
      case 2:
        return (
          <QuizStep
            isSubmitting={isSubmitting}
            applicationSubmitted={applicationSubmitted}
            quizLoading={quizLoading}
            quizQuestions={quizQuestions}
            subject={formik.values.subject}
            topics={formik.values.topics}
            onComplete={(quizSummary: QuizSummary) => {
              if (!isSubmitting && !applicationSubmitted) {
                handleFinalSubmit(quizSummary);
              }
            }}
          />
        );
      case 3:
        return <ApprovalSummaryStep existingApplication={existingApplication} countdown={countdown} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 sm:py-10 px-3 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:min-h-[760px]">
          <StepSidebar currentStep={currentStep} />

          <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <form onSubmit={formik.handleSubmit} className="w-full">
              <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">
                {STEPS[currentStep - 1]?.title}
              </h2>

              {renderStepContent()}

              {!existingApplication && (
                <div className="mt-6 sticky bottom-0 bg-white py-4">
                  {currentStep !== 2 && showSubmit && !applicationSubmitted && (
                    <button
                      type="submit"
                      disabled={isSubmitting || (currentStep === 1 && !formik.isValid)}
                      className="w-full bg-primary-500 text-white rounded-lg px-4 py-2 hover:bg-primary-950 hover:text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isSubmitting
                        ? 'Processing...'
                        : currentStep === 3
                          ? 'Submit Application'
                          : 'Continue to Quiz'}
                    </button>
                  )}
                  {errorMessage && currentStep === 1 && (
                    <div className="mt-2 text-red-600 text-sm text-center">{errorMessage}</div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
