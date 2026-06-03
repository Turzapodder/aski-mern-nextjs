import { Star } from 'lucide-react';

const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export default function FeedbackActions({
  rating,
  setRating,
  comments,
  setComments,
  onComplete,
  loading,
}: any) {
  return (
    <div className="mt-6 pt-5 border-t border-gray-100 space-y-5">
      {/* Rating */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-2">Rate the tutor&apos;s work</p>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className="group p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  (rating ?? 0) >= value
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-200 fill-gray-200 group-hover:text-amber-200 group-hover:fill-amber-200'
                }`}
              />
            </button>
          ))}
          {rating && (
            <span className="ml-2 text-sm font-semibold text-amber-600">
              {ratingLabels[rating]}
            </span>
          )}
        </div>
      </div>

      {/* Comments */}
      <div>
        <label htmlFor="feedback-comments" className="text-sm font-semibold text-gray-900 mb-2 block">
          Comments <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="feedback-comments"
          rows={3}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Share your experience working with this tutor..."
          className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none"
        />
      </div>

      {/* Submit */}
      <button
        disabled={loading || !rating}
        onClick={onComplete}
        className="w-full rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 text-sm font-bold text-white transition-colors"
      >
        {loading ? 'Submitting...' : 'Approve & Complete Assignment'}
      </button>
    </div>
  );
}
