import { useCallback } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { useDragDrop } from "../hooks/use-drag-drop";

interface DropZoneProps {
  compact: boolean;
  onFilesAdded: (paths: ReadonlyArray<string>) => void;
}

export function DropZone({ compact, onFilesAdded }: DropZoneProps) {
  const { isTargeted, onDragOver, onDragLeave, onDrop } = useDragDrop({
    onFilesDropped: onFilesAdded,
  });

  const handleClick = useCallback(async () => {
    try {
      const result = await open({
        multiple: true,
        filters: [
          {
            name: "Video",
            extensions: ["mp4", "mov", "m4v", "m2ts", "ts"],
          },
        ],
      });
      if (result && result.length > 0) {
        onFilesAdded(result);
      }
    } catch {
      // Dialog cancelled or unavailable
    }
  }, [onFilesAdded]);

  const borderColor = isTargeted ? "border-white" : "border-neutral-500";
  const iconColor = isTargeted ? "text-white" : "text-neutral-500";

  if (compact) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-1">
        <button
          type="button"
          onClick={handleClick}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`flex h-[60px] w-[220px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-colors duration-200 ${borderColor}`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-colors duration-200 ${iconColor}`}
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
          </svg>
        </button>
        <span className="text-center text-[10px] leading-tight text-neutral-500">
          Drag files or{"\n"}open to convert
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <button
        type="button"
        onClick={handleClick}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`flex h-[160px] w-[180px] cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed transition-colors duration-200 ${borderColor}`}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-colors duration-200 ${iconColor}`}
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
      </button>
      <span className="whitespace-pre-line text-center text-xs leading-tight text-neutral-500">
        {"Drag files or\nopen to convert"}
      </span>
    </div>
  );
}
