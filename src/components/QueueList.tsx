import { QueueItemRow } from "./QueueItemRow";
import type { QueueItem } from "../types";

interface QueueListProps {
  items: ReadonlyArray<QueueItem>;
  isProcessing: boolean;
  onRemove: (id: string) => void;
  onCancel: () => void;
  onClear: () => void;
  onReveal: (path: string) => void;
}

export function QueueList({
  items,
  isProcessing,
  onRemove,
  onCancel,
  onClear,
  onReveal,
}: QueueListProps) {
  const hasFinishedItems = items.some(
    (item) => item.status.type === "completed" || item.status.type === "skipped",
  );

  const showActionBar = hasFinishedItems || isProcessing;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-3">
        <div className="flex flex-col gap-0.5">
          {items.map((item) => (
            <QueueItemRow
              key={item.id}
              item={item}
              onRemove={() => onRemove(item.id)}
              onReveal={onReveal}
            />
          ))}
        </div>
      </div>

      {showActionBar && (
        <>
          <div className="mx-3 border-t border-neutral-700/50 pt-1" />
          <div className="flex items-center justify-center gap-3 py-2">
            {isProcessing && (
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-neutral-400 transition-colors duration-150 hover:text-white"
              >
                Cancel
              </button>
            )}
            {hasFinishedItems && (
              <button
                type="button"
                onClick={onClear}
                className="text-xs text-neutral-400 transition-colors duration-150 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
