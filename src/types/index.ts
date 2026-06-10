export interface QueueItem {
  readonly id: string;
  readonly inputPath: string;
  readonly filename: string;
  readonly status: QueueItemStatus;
}

export type QueueItemStatus =
  | { readonly type: "pending" }
  | { readonly type: "converting"; readonly progress: number }
  | { readonly type: "completed"; readonly outputPath: string }
  | { readonly type: "skipped"; readonly error: ErrorInfo };

export interface ErrorInfo {
  readonly title: string;
  readonly message: string;
}

export interface VideoMetadata {
  readonly durationSecs: number;
  readonly width: number;
  readonly height: number;
  readonly codec: string;
  readonly fileSize: number;
  readonly bitrate: number;
  readonly isAlreadyHevc: boolean;
}

export interface ConversionSettings {
  readonly preset: ExportPreset;
  readonly encoder: EncoderType;
  readonly preserveTimestamp: boolean;
}

export type ExportPreset = "highQuality" | "standard" | "smallSize";

export type EncoderType =
  | "hevc_videotoolbox"
  | "hevc_nvenc"
  | "hevc_qsv"
  | "libx265";

export interface EncoderInfo {
  readonly id: EncoderType;
  readonly name: string;
  readonly isHardware: boolean;
}

export interface ProgressPayload {
  readonly id: string;
  readonly progress: number;
}

export interface CompletionPayload {
  readonly id: string;
  readonly outputPath: string;
}

export interface ErrorPayload {
  readonly id: string;
  readonly title: string;
  readonly message: string;
}
