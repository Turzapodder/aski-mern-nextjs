import { Star } from 'lucide-react';

export default function FeedbackActions({
  rating,
  setRating,
  comments,
  setComments,
  onComplete,
  loading,
}: any) {
  return (
    <div className="mt-6 space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Rating</p>

        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => setRating(value)}
              className={(rating ?? 0) >= value ? 'text-amber-500' : 'text-gray-300'}
            >
              <Star className="h-5 w-5 fill-current" />
            </button>
          ))}
        </div>
      </div>

      <textarea
        rows={4}
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        className="w-full border rounded-lg p-2 text-sm"
      />

      <button
        disabled={loading || !rating}
        onClick={onComplete}
        className="w-full rounded-lg bg-primary-500 px-4 py-3 text-sm font-semibold text-white"
      >
        {loading ? 'Submitting...' : 'Approve & complete'}
      </button>
    </div>
  );
}
