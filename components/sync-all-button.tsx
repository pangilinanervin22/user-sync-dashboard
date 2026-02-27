"use client";

import { Spinner } from "./spinner";

interface SyncAllButtonProps {
  onClick: () => void;
  isSyncing: boolean;
  unsyncedCount: number;
}

export function SyncAllButton({ onClick, isSyncing, unsyncedCount }: SyncAllButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isSyncing || unsyncedCount === 0}
      className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isSyncing ? (
        <>
          <Spinner />
          Syncing All…
        </>
      ) : (
        `Sync All (${unsyncedCount})`
      )}
    </button>
  );
}
