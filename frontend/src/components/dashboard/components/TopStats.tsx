import { Assignment } from '@/types/assignment';
import Image from 'next/image';
import { useMemo } from 'react';
export default function TopStats({ assignments }: { assignments: Assignment[] }) {
  const completedCount = assignments.filter((a) => a.status === 'completed').length;
  const pendingCount = assignments.filter((a) =>
    ['pending', 'draft', 'created', 'proposal_received', 'proposal_accepted'].includes(a.status)
  ).length;
  const overdueCount = assignments.filter((a) => a.status === 'overdue').length;
  const activeCount = assignments.filter((a) =>
    ['assigned', 'in_progress', 'submission_pending', 'revision_requested', 'submitted'].includes(
      a.status
    )
  ).length;

  const stats = [
    {
      icon: '/assets/icons/tick.png',
      count: completedCount,
      label: 'Completed',
      color: 'text-blue-500',
    },
    {
      icon: '/assets/icons/clock.png',
      count: pendingCount,
      label: 'Pending',
      color: 'text-orange-500',
    },
    {
      icon: '/assets/icons/fire.png',
      count: overdueCount,
      label: 'Overdue',
      color: 'text-red-500',
    },
    {
      icon: '/assets/icons/rocket.png',
      count: activeCount,
      label: 'Active',
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 ">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex items-center flex-col md:flex-row gap-4 bg-white p-8 rounded-3xl"
        >
          <div className="w-[40px] h-[40px] overflow-hidden">
            <Image
              src={stat.icon}
              alt={stat.label}
              width={40}
              height={40}
              className="h-full object-cover"
            />
          </div>
          <div className="flex flex-col md:flex-row md:gap-4 items-center">
            {' '}
            <div className="text-2xl font-semibold text-gray-900">{stat.count}</div>
            <div className="text-md text-black">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};