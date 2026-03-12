import { useRouter } from 'next/navigation';
import TaskItem from './TaskItem';

export default function ProjectSection({
  title,
  assignments,
  latestStatuses,
}: any) {

  const router = useRouter();

  if (!assignments.length) {
    return (
      <div className="mb-8 bg-white p-8 rounded-3xl">
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-center text-gray-500">No results found</p>
      </div>
    );
  }

  const displayAssignments = assignments.slice(0,3);
  const hasMore = assignments.length > 3;

  return (
    <div className="mb-8 bg-white p-8 rounded-3xl">

      <div className="flex justify-between mb-4">

        <h2 className="text-3xl font-bold">
          {title}
        </h2>

        {hasMore && (
          <button
            onClick={()=>router.push('/user/assignments')}
            className="text-primary-600 text-sm"
          >
            View All
          </button>
        )}

      </div>

      <div className="space-y-3">
        {displayAssignments.map((a:any)=>(
          <TaskItem
            key={a._id}
            task={a}
            submissionStatus={latestStatuses[a._id]?.status}
          />
        ))}
      </div>

    </div>
  );
}