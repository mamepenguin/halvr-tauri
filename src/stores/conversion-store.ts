import { create } from "zustand";
import type {
  QueueItem,
  QueueItemStatus,
  ConversionSettings,
  EncoderInfo,
} from "../types";

interface ConversionStore {
  readonly queueItems: ReadonlyArray<QueueItem>;
  readonly isProcessing: boolean;
  readonly settings: ConversionSettings;
  readonly availableEncoders: ReadonlyArray<EncoderInfo>;
  setQueueItems: (items: ReadonlyArray<QueueItem>) => void;
  updateItemStatus: (id: string, status: QueueItemStatus) => void;
  setProcessing: (v: boolean) => void;
  setSettings: (s: ConversionSettings) => void;
  setEncoders: (e: ReadonlyArray<EncoderInfo>) => void;
}

const DEFAULT_SETTINGS: ConversionSettings = {
  preset: "highQuality",
  encoder: "libx265",
  preserveTimestamp: true,
};

export const useConversionStore = create<ConversionStore>((set) => ({
  queueItems: [],
  isProcessing: false,
  settings: DEFAULT_SETTINGS,
  availableEncoders: [],

  setQueueItems: (items) => set({ queueItems: [...items] }),

  updateItemStatus: (id, status) =>
    set((state) => ({
      queueItems: state.queueItems.map((item) =>
        item.id === id ? { ...item, status } : item,
      ),
    })),

  setProcessing: (v) => set({ isProcessing: v }),

  setSettings: (s) => set({ settings: { ...s } }),

  setEncoders: (e) => set({ availableEncoders: [...e] }),
}));
