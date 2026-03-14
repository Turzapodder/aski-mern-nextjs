import { CheckCircle, Clock, AlertCircle, PlayCircle, MoreVertical } from 'lucide-react';
import Link from 'next/link';

export default function TaskItem({ task, submissionStatus }: any) {
  const getIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'overdue':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case 'pending':
      case 'draft':
      case 'created':
      case 'proposal_received':
      case 'proposal_accepted':
        return <Clock className="w-6 h-6 text-orange-500" />;
      default:
        return <PlayCircle className="w-6 h-6 text-blue-500" />;
    }
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center space-x-4 p-4 border flex-1 bg-white rounded-2xl">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          {getIcon(task.status)}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-lg">{task.title}</h3>
          <p className="text-sm text-gray-500">
            {task.subject} - {task.topics.slice(0, 2).join(', ')}
          </p>
        </div>

        <Link
          href={`/user/assignments/view-details/${task._id}`}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <MoreVertical className="w-6 h-6 text-black" />
        </Link>
      </div>
    </div>
  );
}
