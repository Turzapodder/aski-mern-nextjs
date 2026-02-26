import { Skeleton } from "@/components/ui/skeleton"

const LoadingIndicator = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white/10 px-10 py-8">
        <Skeleton className="h-24 w-24 rounded-full bg-white/60" />
        <Skeleton className="h-4 w-40 bg-white/60" />
      </div>
    </div>
  )
}

export default LoadingIndicator
