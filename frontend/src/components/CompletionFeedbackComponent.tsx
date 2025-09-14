import React from 'react';
import { Award, Star, ThumbsUp, MessageSquare, Download } from 'lucide-react';

interface CompletionFeedbackComponentProps {
  onSubmitFeedback: (rating: number, feedback: string) => void;
}

const CompletionFeedbackComponent: React.FC<CompletionFeedbackComponentProps> = ({ 
  onSubmitFeedback 
}) => {
  const [rating, setRating] = React.useState<number>(0);
  const [feedback, setFeedback] = React.useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitFeedback(rating, feedback);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
          <Award size={32} className="text-primary-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Assignment Completed!</h2>
        <p className="text-gray-600">Your assignment has been successfully completed and delivered.</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <ThumbsUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">Solution Delivered</h3>
            <div className="mt-2 text-sm text-green-700">
              <p>The solution to your calculus assignment has been delivered and is ready for download.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Solution Files</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <MessageSquare size={20} className="text-primary-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Calculus_Integration_Solution.pdf</div>
                <div className="text-xs text-gray-500">PDF • 3.2 MB • Uploaded 2 days ago</div>
              </div>
            </div>
            <button className="text-primary-600 hover:text-primary-700">
              <Download size={20} />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                <MessageSquare size={20} className="text-secondary-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Step_by_Step_Explanation.pdf</div>
                <div className="text-xs text-gray-500">PDF • 1.8 MB • Uploaded 2 days ago</div>
              </div>
            </div>
            <button className="text-primary-600 hover:text-primary-700">
              <Download size={20} />
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Provide Your Feedback</h3>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rate your experience
          </label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <Star
                  size={24}
                  className={`${rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your feedback
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your experience with the solution provided..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-300 resize-none"
          />
        </div>
        
        <button
          type="submit"
          className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
        >
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default CompletionFeedbackComponent;