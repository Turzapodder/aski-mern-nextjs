import SubmissionDetails from './SubmissionDetails';
import FeedbackActions from './FeedbackActions';
import { useCompletionFeedback } from './hooks/useCompletionFeedback';

const CompletionFeedbackComponent = ({ assignment, onCompleted }: any) => {

  const {
    rating,
    setRating,
    comments,
    setComments,
    latestSubmission,
    feedbackLoading,
    handleSubmitFeedback
  } = useCompletionFeedback(assignment, onCompleted);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">

      <h2 className="text-xl font-semibold mb-4">
        Submission review
      </h2>

      <SubmissionDetails submission={latestSubmission} />

      {assignment.status === 'submitted' && (
        <FeedbackActions
          rating={rating}
          setRating={setRating}
          comments={comments}
          setComments={setComments}
          onComplete={handleSubmitFeedback}
          loading={feedbackLoading}
        />
      )}

    </div>
  );
};

export default CompletionFeedbackComponent;