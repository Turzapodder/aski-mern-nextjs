"use client"

export const SUBJECTS = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "English",
    "History",
    "Economics",
    "Business",
    "Engineering",
    "Other",
]

interface SubjectSelectProps {
    value: string
    onChange: (value: string) => void
}

export function SubjectSelect({ value, onChange }: SubjectSelectProps) {
    return (
        <div className="mb-6">
            <label className="block text-gray-900 font-medium mb-2">Subject</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent bg-white"
            >
                <option value="">Select a Subject</option>
                {SUBJECTS.map((subject) => (
                    <option key={subject} value={subject}>
                        {subject}
                    </option>
                ))}
            </select>
        </div>
    )
}
