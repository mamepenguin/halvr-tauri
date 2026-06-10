import { useEffect, useCallback, useRef } from "react";
import { useConversionStore } from "../stores/conversion-store";
import {
  startConversion,
  cancelConversion as cancelCmd,
  clearCompleted as clearCmd,
  removeItem as removeCmd,
  getQueue,
} from "../lib/commands";
import {
  onConversionProgress,
  onConversionComplete,
  onConversionError,
} from "../lib/events";
import type { UnlistenFn } from "@tauri-apps/api/event";

interface UseConversionResult {
  addFiles: (paths: ReadonlyArray<string>) => Promise<void>;
  cancel: () => Promise<void>;
  clearCompleted: () => Promise<void>;
  removeItem: (id: string) => Promise<void>;
}

export function useConversion(): UseConversionResult {
  const store = useConversionStore();
  const storeRef = useRef(store);
  storeRef.current = store;

  useEffect(() => {
    const unlisteners: Promise<UnlistenFn>[] = [];

    unlisteners.push(
      onConversionProgress((payload) => {
        storeRef.current.updateItemStatus(payload.id, {
          type: "converting",
          progress: payload.progress,
        });
        storeRef.current.setProcessing(true);
      }),
    );

    unlisteners.push(
      onConversionComplete((payload) => {
        storeRef.current.updateItemStatus(payload.id, {
          type: "completed",
          outputPath: payload.outputPath,
        });
        syncQueue();
      }),
    );

    unlisteners.push(
      onConversionError((payload) => {
        storeRef.current.updateItemStatus(payload.id, {
          type: "skipped",
          error: { title: payload.title, message: payload.message },
        });
        syncQueue();
      }),
    );

    return () => {
      for (const p of unlisteners) {
        p.then((unlisten) => unlisten());
      }
    };
  }, []);

  const syncQueue = useCallback(async () => {
    try {
      const queue = await getQueue();
      storeRef.current.setQueueItems(queue);
      const hasConverting = queue.some(
        (item) => item.status.type === "converting",
      );
      const hasPending = queue.some((item) => item.status.type === "pending");
      storeRef.current.setProcessing(hasConverting || hasPending);
    } catch {
      // Queue sync failures are non-critical
    }
  }, []);

  const addFiles = useCallback(
    async (paths: ReadonlyArray<string>) => {
      try {
        const queue = await startConversion(
          paths,
          storeRef.current.settings,
        );
        storeRef.current.setQueueItems(queue);
        storeRef.current.setProcessing(true);
      } catch {
        // Start conversion failure handled by backend events
      }
    },
    [],
  );

  const cancel = useCallback(async () => {
    try {
      await cancelCmd();
      storeRef.current.setProcessing(false);
      await syncQueue();
    } catch {
      // Cancel failure is non-critical
    }
  }, [syncQueue]);

  const clearCompleted = useCallback(async () => {
    try {
      const queue = await clearCmd();
      storeRef.current.setQueueItems(queue);
    } catch {
      // Clear failure is non-critical
    }
  }, []);

  const removeItem = useCallback(async (id: string) => {
    try {
      const queue = await removeCmd(id);
      storeRef.current.setQueueItems(queue);
    } catch {
      // Remove failure is non-critical
    }
  }, []);

  return { addFiles, cancel, clearCompleted, removeItem };
}
