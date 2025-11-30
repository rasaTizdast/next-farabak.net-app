const GradeCardSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-lg bg-slate-700 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-600 p-3">
        <div className="h-7 w-24 animate-pulse rounded-md bg-slate-600" />
        <div className="flex gap-2">
          <div className="h-8 w-8 animate-pulse rounded-md bg-slate-600" />
          <div className="h-8 w-8 animate-pulse rounded-md bg-slate-600" />
        </div>
      </div>
      <div className="space-y-3 p-3">
        <div className="flex items-center justify-between rounded-md bg-slate-600/50 p-3">
          <div className="h-5 w-20 animate-pulse rounded bg-slate-500" />
          <div className="h-5 w-48 animate-pulse rounded bg-slate-500" />
        </div>
        <div className="flex items-center justify-between rounded-md bg-slate-600/50 p-3">
          <div className="h-5 w-16 animate-pulse rounded bg-slate-500" />
          <div className="h-5 w-48 animate-pulse rounded bg-slate-500" />
        </div>
        <div className="flex items-center justify-between rounded-md bg-green-500/10 p-3">
          <div className="h-5 w-24 animate-pulse rounded bg-slate-500" />
          <div className="h-5 w-48 animate-pulse rounded bg-slate-500" />
        </div>
      </div>
    </div>
  );
};

export default GradeCardSkeleton;
