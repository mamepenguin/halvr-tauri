import { useState, useEffect, useCallback, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getSupportedExtensions } from "../lib/commands";

interface UseDragDropOptions {
  onFilesDropped: (paths: ReadonlyArray<string>) => void;
}

interface UseDragDropResult {
  readonly isTargeted: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

function getExtension(path: string): string {
  const lastDot = path.lastIndexOf(".");
  if (lastDot === -1) return "";
  return path.slice(lastDot + 1).toLowerCase();
}

export function useDragDrop(options: UseDragDropOptions): UseDragDropResult {
  const [isTargeted, setIsTargeted] = useState(false);
  const extensionsRef = useRef<string[]>([]);
  const onFilesDroppedRef = useRef(options.onFilesDropped);
  onFilesDroppedRef.current = options.onFilesDropped;

  useEffect(() => {
    getSupportedExtensions()
      .then((exts) => {
        extensionsRef.current = exts;
      })
      .catch(() => {
        extensionsRef.current = ["mp4", "mov", "m4v", "m2ts", "ts"];
      });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const appWindow = getCurrentWindow();
    const unlistenPromise = appWindow.onDragDropEvent((event) => {
      if (cancelled) return;

      const data = event.payload;
      if (data.type === "over" || data.type === "enter") {
        setIsTargeted(true);
      } else if (data.type === "drop") {
        setIsTargeted(false);
        const filtered = filterSupportedFiles(
          data.paths,
          extensionsRef.current,
        );
        if (filtered.length > 0) {
          onFilesDroppedRef.current(filtered);
        }
      } else if (data.type === "leave") {
        setIsTargeted(false);
      }
    });

    return () => {
      cancelled = true;
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsTargeted(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsTargeted(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsTargeted(false);
  }, []);

  return { isTargeted, onDragOver, onDragLeave, onDrop };
}

function filterSupportedFiles(
  paths: ReadonlyArray<string>,
  supportedExtensions: ReadonlyArray<string>,
): string[] {
  return paths.filter((path) => {
    const ext = getExtension(path);
    return supportedExtensions.includes(ext);
  });
}
