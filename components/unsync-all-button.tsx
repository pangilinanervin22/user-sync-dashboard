"use client";

import { Spinner } from "./spinner";

interface UnsyncAllButtonProps {
  onClick: () => void;
  isUnsyncing: boolean;
  syncedCount: number;
}

export function UnsyncAllButton({ onClick, isUnsyncing, syncedCount }: UnsyncAllButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isUnsyncing || syncedCount === 0}
      className="inline-flex items-center gap-2 rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isUnsyncing ? (
        <>
          <Spinner />
          Unsyncing…
        </>
      ) : (
        `Unsync All (${syncedCount})`
      )}
    </button>
  );
}
