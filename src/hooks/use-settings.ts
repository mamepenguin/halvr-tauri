import { useState, useEffect, useCallback, useRef } from "react";
import { useConversionStore } from "../stores/conversion-store";
import {
  loadSettings as loadCmd,
  saveSettings as saveCmd,
  detectAvailableEncoders,
} from "../lib/commands";
import type { ConversionSettings, EncoderInfo } from "../types";

interface UseSettingsResult {
  readonly settings: ConversionSettings;
  readonly availableEncoders: ReadonlyArray<EncoderInfo>;
  updateSettings: (settings: ConversionSettings) => Promise<void>;
  readonly isLoading: boolean;
}

export function useSettings(): UseSettingsResult {
  const [isLoading, setIsLoading] = useState(true);
  const store = useConversionStore();
  const storeRef = useRef(store);
  storeRef.current = store;

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const [settings, encoders] = await Promise.all([
          loadCmd(),
          detectAvailableEncoders(),
        ]);
        if (!cancelled) {
          storeRef.current.setSettings(settings);
          storeRef.current.setEncoders(encoders);
        }
      } catch {
        // Use default settings on failure
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateSettings = useCallback(
    async (newSettings: ConversionSettings) => {
      storeRef.current.setSettings(newSettings);
      try {
        await saveCmd(newSettings);
      } catch {
        // Save failure is non-critical; settings are already in memory
      }
    },
    [],
  );

  return {
    settings: store.settings,
    availableEncoders: store.availableEncoders,
    updateSettings,
    isLoading,
  };
}
