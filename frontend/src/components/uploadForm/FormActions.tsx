import { Skeleton } from '@/components/ui/skeleton';

interface FormActionsProps {
  isAdvanced: boolean;
  isCreating: boolean;
  onToggleAdvanced: () => void;
  onCancel?: () => void;
}

export function FormActions({
  isAdvanced,
  isCreating,
  onToggleAdvanced,
  onCancel,
}: FormActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-100 gap-4">
      <button
        type="button"
        onClick={onToggleAdvanced}
        className="text-primary-600 hover:text-primary-700 text-xs sm:text-sm font-medium hover:underline transition-colors flex items-center"
      >
        {isAdvanced ? 'Hide Options' : 'Show More Options'}
      </button>

      <div className="flex w-full sm:w-auto space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isCreating}
          className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors disabled:opacity-50 text-sm sm:text-base"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isCreating}
          className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {isCreating ? (
            <>
              <Skeleton className="h-4 w-4 mr-2 rounded-full" />
              Posting...
            </>
          ) : (
            'Post Now'
          )}
        </button>
      </div>
    </div>
  );
}
