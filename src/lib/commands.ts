import { invoke } from "@tauri-apps/api/core";
import type {
  QueueItem,
  ConversionSettings,
  EncoderInfo,
  VideoMetadata,
} from "../types";

export interface FileValidation {
  readonly path: string;
  readonly filename: string;
  readonly supported: boolean;
}

export async function startConversion(
  paths: ReadonlyArray<string>,
  settings: ConversionSettings,
): Promise<QueueItem[]> {
  return invoke<QueueItem[]>("start_conversion", { paths, settings });
}

export async function addToQueue(
  paths: ReadonlyArray<string>,
): Promise<QueueItem[]> {
  return invoke<QueueItem[]>("add_to_queue", { paths });
}

export async function cancelConversion(): Promise<void> {
  return invoke<void>("cancel_conversion");
}

export async function removeItem(itemId: string): Promise<QueueItem[]> {
  return invoke<QueueItem[]>("remove_item", { itemId });
}

export async function clearCompleted(): Promise<QueueItem[]> {
  return invoke<QueueItem[]>("clear_completed");
}

export async function getQueue(): Promise<QueueItem[]> {
  return invoke<QueueItem[]>("get_queue");
}

export async function detectAvailableEncoders(): Promise<EncoderInfo[]> {
  return invoke<EncoderInfo[]>("detect_available_encoders");
}

export async function getMetadata(path: string): Promise<VideoMetadata> {
  return invoke<VideoMetadata>("get_metadata", { path });
}

export async function validateFiles(
  paths: ReadonlyArray<string>,
): Promise<FileValidation[]> {
  return invoke<FileValidation[]>("validate_files", { paths });
}

export async function getSupportedExtensions(): Promise<string[]> {
  return invoke<string[]>("get_supported_extensions");
}

export async function revealInFolder(path: string): Promise<void> {
  return invoke<void>("reveal_in_folder", { path });
}

export async function getPlatform(): Promise<string> {
  return invoke<string>("get_platform");
}

export async function loadSettings(): Promise<ConversionSettings> {
  return invoke<ConversionSettings>("load_settings");
}

export async function saveSettings(
  settings: ConversionSettings,
): Promise<void> {
  return invoke<void>("save_settings", { settings });
}
