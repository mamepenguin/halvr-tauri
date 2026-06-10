import { useCallback } from "react";
import type { ConversionSettings, EncoderInfo, ExportPreset, EncoderType } from "../types";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ConversionSettings;
  availableEncoders: ReadonlyArray<EncoderInfo>;
  onSettingsChange: (settings: ConversionSettings) => void;
}

const PRESET_LABELS: Record<ExportPreset, string> = {
  highQuality: "High Quality",
  standard: "Standard",
  smallSize: "Small Size",
};

const PRESETS: ReadonlyArray<ExportPreset> = [
  "highQuality",
  "standard",
  "smallSize",
];

export function SettingsDialog({
  isOpen,
  onClose,
  settings,
  availableEncoders,
  onSettingsChange,
}: SettingsDialogProps) {
  if (!isOpen) {
    return null;
  }

  const handleEncoderChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const encoder = e.target.value as EncoderType;
      onSettingsChange({ ...settings, encoder });
    },
    [settings, onSettingsChange],
  );

  const handlePresetChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const preset = e.target.value as ExportPreset;
      onSettingsChange({ ...settings, preset });
    },
    [settings, onSettingsChange],
  );

  const handleTimestampToggle = useCallback(() => {
    onSettingsChange({
      ...settings,
      preserveTimestamp: !settings.preserveTimestamp,
    });
  }, [settings, onSettingsChange]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-[250px] rounded-xl border border-neutral-700 bg-neutral-900 p-4 shadow-xl">
        <h2 className="mb-4 text-center text-sm font-semibold text-white">
          Settings
        </h2>

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-neutral-400">Encoder</span>
            <select
              value={settings.encoder}
              onChange={handleEncoderChange}
              className="rounded-md border border-neutral-600 bg-neutral-800 px-2 py-1.5 text-xs text-white outline-none focus:border-neutral-400"
            >
              {availableEncoders.map((encoder) => (
                <option key={encoder.id} value={encoder.id}>
                  {encoder.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-neutral-400">Quality</span>
            <select
              value={settings.preset}
              onChange={handlePresetChange}
              className="rounded-md border border-neutral-600 bg-neutral-800 px-2 py-1.5 text-xs text-white outline-none focus:border-neutral-400"
            >
              {PRESETS.map((preset) => (
                <option key={preset} value={preset}>
                  {PRESET_LABELS[preset]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">
              Preserve Timestamp
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={settings.preserveTimestamp}
              onClick={handleTimestampToggle}
              className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${
                settings.preserveTimestamp ? "bg-blue-500" : "bg-neutral-600"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
                  settings.preserveTimestamp ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </label>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors duration-150 hover:bg-blue-500"
        >
          Close
        </button>
      </div>
    </div>
  );
}
