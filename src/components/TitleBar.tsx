import { useCallback, useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getPlatform } from "../lib/commands";

interface TitleBarProps {
  onSettingsClick: () => void;
}

function MacCloseButton({ onClick }: { readonly onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={(e) => e.stopPropagation()}
      className="group flex h-3 w-3 items-center justify-center rounded-full bg-[#ff5f57] transition-colors duration-200 hover:bg-[#ff3b30]"
      aria-label="Close"
    >
      <svg
        width="6"
        height="6"
        viewBox="0 0 6 6"
        className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        fill="none"
        stroke="#4a0002"
        strokeWidth="1.2"
        strokeLinecap="round"
      >
        <line x1="1" y1="1" x2="5" y2="5" />
        <line x1="5" y1="1" x2="1" y2="5" />
      </svg>
    </button>
  );
}

function WinCloseButton({ onClick }: { readonly onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={(e) => e.stopPropagation()}
      className="flex h-8 w-11 items-center justify-center text-neutral-400 transition-colors duration-200 hover:bg-[#e81123] hover:text-white"
      aria-label="Close"
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      >
        <line x1="1" y1="1" x2="9" y2="9" />
        <line x1="9" y1="1" x2="1" y2="9" />
      </svg>
    </button>
  );
}

export function TitleBar({ onSettingsClick }: TitleBarProps) {
  const [platform, setPlatform] = useState<string>("macos");

  useEffect(() => {
    getPlatform()
      .then(setPlatform)
      .catch(() => {});
  }, []);

  const isMac = platform === "macos";

  const handleMouseDown = useCallback(async () => {
    try {
      await getCurrentWindow().startDragging();
    } catch {
      // Dragging not available outside Tauri context
    }
  }, []);

  const handleClose = useCallback(async () => {
    try {
      await getCurrentWindow().close();
    } catch {
      // Close not available outside Tauri context
    }
  }, []);

  return (
    <div
      className="flex items-center px-3 py-2"
      data-tauri-drag-region
      onMouseDown={handleMouseDown}
    >
      <div className="flex flex-1 items-center" data-tauri-drag-region>
        {isMac && <MacCloseButton onClick={handleClose} />}
      </div>

      <span
        className="text-[13px] font-medium text-white"
        data-tauri-drag-region
      >
        Convert Video
      </span>

      <div className="flex flex-1 items-center justify-end" data-tauri-drag-region>
        <button
          type="button"
          onClick={onSettingsClick}
          onMouseDown={(e) => e.stopPropagation()}
          className="flex items-center justify-center rounded p-1 text-neutral-400 transition-colors duration-200 hover:text-white"
          aria-label="Settings"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
        {!isMac && <WinCloseButton onClick={handleClose} />}
      </div>
    </div>
  );
}
