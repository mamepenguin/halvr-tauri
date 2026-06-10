import type { QueueItem, QueueItemStatus } from "../types";

interface QueueItemRowProps {
  item: QueueItem;
  onRemove: () => void;
  onReveal: (path: string) => void;
}

export function QueueItemRow({ item, onRemove, onReveal }: QueueItemRowProps) {
  const isConverting = item.status.type === "converting";
  const bgClass = isConverting ? "bg-white/5" : "bg-transparent";

  return (
    <div
      className={`flex items-center gap-2 rounded-md px-2 py-1 ${bgClass}`}
    >
      <StatusIcon status={item.status} />

      <span className="min-w-0 flex-1 truncate text-[11px] text-white">
        {item.filename}
      </span>

      <StatusLabel
        status={item.status}
        onRemove={onRemove}
        onReveal={onReveal}
      />
    </div>
  );
}

function StatusIcon({ status }: { status: QueueItemStatus }) {
  switch (status.type) {
    case "pending":
      return (
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-neutral-500"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "converting":
      return (
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          className="shrink-0 animate-spin text-white"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="31.4 31.4"
            strokeLinecap="round"
          />
        </svg>
      );
    case "completed":
      return (
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-green-500"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    case "skipped":
      return (
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="shrink-0 text-yellow-500"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line
            x1="12"
            y1="9"
            x2="12"
            y2="13"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="12"
            y1="17"
            x2="12.01"
            y2="17"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

function StatusLabel({
  status,
  onRemove,
  onReveal,
}: {
  status: QueueItemStatus;
  onRemove: () => void;
  onReveal: (path: string) => void;
}) {
  switch (status.type) {
    case "pending":
      return (
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 text-neutral-500 transition-colors duration-150 hover:text-white"
          aria-label="Remove"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      );
    case "converting":
      return (
        <span className="shrink-0 font-mono text-[10px] text-neutral-400">
          {Math.round(status.progress * 100)}%
        </span>
      );
    case "completed":
      return (
        <button
          type="button"
          onClick={() => onReveal(status.outputPath)}
          className="shrink-0 text-blue-400 transition-colors duration-150 hover:text-blue-300"
          aria-label="Reveal in Finder"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      );
    case "skipped":
      return (
        <span className="shrink-0 text-[10px] text-yellow-500">
          {status.error.title}
        </span>
      );
  }
}
