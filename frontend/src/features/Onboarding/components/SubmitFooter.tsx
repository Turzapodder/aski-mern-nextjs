interface SubmitFooterProps {
  currentStep: number;
  showSubmit: boolean;
  applicationSubmitted: boolean;
  isSubmitting: boolean;
  isFormValid: boolean;
  existingApplication: unknown;
}

export function SubmitFooter({
  currentStep,
  showSubmit,
  applicationSubmitted,
  isSubmitting,
  isFormValid,
  existingApplication,
  errorMessage,
}: SubmitFooterProps & { errorMessage: string }) {
  if (existingApplication) return null;

  return (
    <div className="mt-6 sticky bottom-0 bg-white py-4">
      {currentStep !== 2 && showSubmit && !applicationSubmitted && (
        <button
          type="submit"
          disabled={isSubmitting || (currentStep === 1 && !isFormValid)}
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
  );
}
