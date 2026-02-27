"use client";

interface SyncStatusBadgeProps {
  syncedAt: string | null;
}

export function SyncStatusBadge({ syncedAt }: SyncStatusBadgeProps) {
  if (syncedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-500/30">
        <span className="h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-400" />
        Synced
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-500/30">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
      Pending
    </span>
  );
}
