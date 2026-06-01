import { type KeyboardEvent } from 'react';
import { Plus } from 'lucide-react';

interface TopicsInputProps {
  topics: string[];
  newTopic: string;
  onNewTopicChange: (val: string) => void;
  onAddTopic: () => void;
  onRemoveTopic: (topic: string) => void;
  onKeyPress: (e: KeyboardEvent) => void;
}

export function TopicsInput({
  topics,
  newTopic,
  onNewTopicChange,
  onAddTopic,
  onRemoveTopic,
  onKeyPress,
}: TopicsInputProps) {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <label className="text-gray-900 font-medium text-sm sm:text-base">Topics</label>
        <span className="text-gray-400 text-[10px] sm:text-xs">
          {12 - topics.length} topics remaining
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
        {topics.map((topic, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 bg-gray-900 text-white rounded-full text-[10px] sm:text-sm"
          >
            {topic}
            <button
              type="button"
              onClick={() => onRemoveTopic(topic)}
              className="ml-1.5 text-gray-300 hover:text-white"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Add topics (e.g. algebra...)"
          value={newTopic}
          onChange={(e) => onNewTopicChange(e.target.value)}
          onKeyPress={onKeyPress}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent text-xs sm:text-sm pr-10"
        />
        <button
          type="button"
          onClick={onAddTopic}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500"
        >
          <Plus size={18} className="sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}
