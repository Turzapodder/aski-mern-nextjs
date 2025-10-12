"use client"

interface Props {
  value: number; // 0-100
}

export default function ProfileProgress({ value }: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">Profile Completion</span>
        <span className="text-sm text-gray-600">{pct}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded h-2">
        <div className="bg-green-500 h-2 rounded" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}