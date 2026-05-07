export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="space-y-3">
      <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
      <div className="h-28 animate-pulse rounded-lg bg-slate-100 dark:bg-white/5" />
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
