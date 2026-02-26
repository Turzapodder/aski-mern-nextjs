"use client"
import { Plus } from "lucide-react"

interface TopicsInputProps {
    topics: string[]
    newTopic: string
    onNewTopicChange: (v: string) => void
    onAdd: () => void
    onRemove: (topic: string) => void
    onKeyPress: (e: React.KeyboardEvent) => void
}

export function TopicsInput({
    topics,
    newTopic,
    onNewTopicChange,
    onAdd,
    onRemove,
    onKeyPress,
}: TopicsInputProps) {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
                <label className="text-gray-900 font-medium">Topics</label>
                <span className="text-gray-400 text-sm">{12 - topics.length} topics remaining</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
                {topics.map((topic, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-gray-900 text-white rounded-full text-sm"
                    >
                        {topic}
                        <button
                            type="button"
                            onClick={() => onRemove(topic)}
                            className="ml-2 text-gray-300 hover:text-white"
                        >
                            ×
                        </button>
                    </span>
                ))}
            </div>

            <div className="relative">
                <input
                    type="text"
                    placeholder="Add topics (e.g. algebra, calculus, essay ...)"
                    value={newTopic}
                    onChange={(e) => onNewTopicChange(e.target.value)}
                    onKeyPress={onKeyPress}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent text-sm pr-10"
                />
                <button
                    type="button"
                    onClick={onAdd}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500"
                >
                    <Plus size={20} />
                </button>
            </div>
        </div>
    )
}
