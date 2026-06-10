import { listen, type UnlistenFn } from "@tauri-apps/api/event";

interface RawProgressPayload {
  readonly itemId: string;
  readonly progress: number;
}

interface RawCompletionPayload {
  readonly itemId: string;
  readonly outputPath: string;
}

interface RawErrorPayload {
  readonly itemId: string;
  readonly title: string;
  readonly message: string;
}

export interface ProgressEvent {
  readonly id: string;
  readonly progress: number;
}

export interface CompletionEvent {
  readonly id: string;
  readonly outputPath: string;
}

export interface ErrorEvent {
  readonly id: string;
  readonly title: string;
  readonly message: string;
}

export async function onConversionProgress(
  handler: (payload: ProgressEvent) => void,
): Promise<UnlistenFn> {
  return listen<RawProgressPayload>("conversion-progress", (event) => {
    handler({
      id: event.payload.itemId,
      progress: event.payload.progress,
    });
  });
}

export async function onConversionComplete(
  handler: (payload: CompletionEvent) => void,
): Promise<UnlistenFn> {
  return listen<RawCompletionPayload>("conversion-complete", (event) => {
    handler({
      id: event.payload.itemId,
      outputPath: event.payload.outputPath,
    });
  });
}

export async function onConversionError(
  handler: (payload: ErrorEvent) => void,
): Promise<UnlistenFn> {
  return listen<RawErrorPayload>("conversion-error", (event) => {
    handler({
      id: event.payload.itemId,
      title: event.payload.title,
      message: event.payload.message,
    });
  });
}
