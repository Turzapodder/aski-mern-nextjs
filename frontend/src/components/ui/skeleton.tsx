import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-slate-200/80 dark:bg-slate-800/60 before:absolute before:inset-0 before:-translate-x-full before:animate-skeleton-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/80 before:to-transparent dark:before:via-white/10',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
