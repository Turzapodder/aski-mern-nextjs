import { Skeleton } from "@/components/ui/skeleton";

const SidebarNavSkeleton = () => (
  <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-white">
    <div className="px-4 py-6 space-y-3">
      <Skeleton className="h-8 w-32" />
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full rounded-xl" />
      ))}
    </div>
  </aside>
);

const TopBarSkeleton = () => (
  <div className="border-b bg-white px-4 py-4">
    <div className="flex items-center justify-between gap-3">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-36 rounded-lg" />
        <Skeleton className="h-11 w-11 rounded-lg" />
        <Skeleton className="h-11 w-11 rounded-full" />
      </div>
    </div>
  </div>
);

const GenericUserContentSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-72" />
    </div>

    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <Skeleton className="h-56 w-full rounded-3xl" />
        <Skeleton className="h-24 w-full rounded-3xl" />
        <Skeleton className="h-72 w-full rounded-3xl" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-80 w-full rounded-3xl" />
        <Skeleton className="h-72 w-full rounded-3xl" />
      </div>
    </div>
  </div>
);

const StatCardsSkeleton = () => (
  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="rounded-3xl bg-white p-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-12" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const UploadFormSkeleton = () => (
  <div className="rounded-3xl bg-white p-8 shadow-sm">
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
      <div className="flex justify-end gap-3">
        <Skeleton className="h-11 w-28 rounded-xl" />
        <Skeleton className="h-11 w-36 rounded-xl" />
      </div>
    </div>
  </div>
);

const ProjectRowSkeleton = () => (
  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-md shadow-gray-100">
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="grid flex-1 gap-4 md:grid-cols-4">
        <div className="space-y-2 md:col-span-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center justify-start md:justify-end">
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
  </div>
);

const ProjectSectionSkeleton = () => (
  <div className="rounded-3xl bg-white p-8 shadow-sm">
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-7 w-10 rounded-lg" />
      </div>
      <Skeleton className="h-5 w-20" />
    </div>
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <ProjectRowSkeleton key={index} />
      ))}
    </div>
  </div>
);

const TutorStatCardSkeleton = () => (
  <div className="rounded-[2rem] bg-[#E3F2FD] p-6">
    <div className="mb-4 flex items-start justify-between">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      <Skeleton className="h-6 w-6 rounded-full" />
    </div>
    <Skeleton className="mb-2 h-4 w-40" />
    <Skeleton className="h-6 w-24 rounded-full" />
  </div>
);

const TutorProjectCardSkeleton = () => (
  <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
    <div className="mb-4 flex items-start justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-5 w-5 rounded-full" />
    </div>
    <div className="mb-4 flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="space-y-2 text-right">
        <Skeleton className="ml-auto h-3 w-16" />
        <Skeleton className="ml-auto h-5 w-24" />
      </div>
    </div>
    <Skeleton className="mb-2 h-2 w-full rounded-full" />
    <div className="flex justify-between">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-3 w-10" />
    </div>
  </div>
);

const TutorTableSkeleton = () => (
  <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            {Array.from({ length: 5 }).map((_, index) => (
              <th key={index} className="px-6 py-4 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {Array.from({ length: 5 }).map((_, index) => (
            <tr key={index}>
              <td className="px-6 py-4"><Skeleton className="h-10 w-44" /></td>
              <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
              <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
              <td className="px-6 py-4"><Skeleton className="h-5 w-16" /></td>
              <td className="px-6 py-4 text-right"><Skeleton className="ml-auto h-6 w-6 rounded-full" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const DashboardCalendarSkeleton = () => (
  <div className="rounded-xl border bg-white p-6 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <Skeleton className="h-9 w-9 rounded-lg" />
      <Skeleton className="h-6 w-36" />
      <Skeleton className="h-9 w-9 rounded-lg" />
    </div>
    <div className="mb-3 grid grid-cols-7 gap-2">
      {Array.from({ length: 7 }).map((_, index) => (
        <Skeleton key={index} className="h-5 w-full rounded-md" />
      ))}
    </div>
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 35 }).map((_, index) => (
        <Skeleton key={index} className="h-8 w-8 rounded-full" />
      ))}
    </div>
  </div>
);

export const StudentDashboardContentSkeleton = () => (
  <div className="space-y-8">
    <StatCardsSkeleton />
    <UploadFormSkeleton />
    <ProjectSectionSkeleton />
    <ProjectSectionSkeleton />
    <ProjectSectionSkeleton />
  </div>
);

export const TutorDashboardContentSkeleton = () => (
  <div className="space-y-10 rounded-[2rem] bg-gray-50 p-4 md:p-8">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-52" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <Skeleton className="h-11 w-11 rounded-xl" />
      </div>
    </div>

    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <TutorStatCardSkeleton />
        <TutorProjectCardSkeleton />
        <TutorProjectCardSkeleton />
      </div>
    </div>

    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-44" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>
      <TutorTableSkeleton />
    </div>
  </div>
);

export const DashboardPageSkeleton = () => (
  <div className="w-full">
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1">
        <StudentDashboardContentSkeleton />
      </div>
      <div className="w-full space-y-6 md:w-80">
        <DashboardCalendarSkeleton />
      </div>
    </div>
  </div>
);

export const UserShellSkeleton = () => (
  <div className="min-h-screen bg-gray-100">
    <div className="flex">
      <SidebarNavSkeleton />
      <div className="flex-1">
        <TopBarSkeleton />
        <div className="p-6">
          <GenericUserContentSkeleton />
        </div>
      </div>
    </div>
  </div>
);