export function formatDuration(secs: number): string {
  const totalSeconds = Math.round(secs);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(seconds).padStart(2, "0");
  return `${paddedMinutes}:${paddedSeconds}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  if (unitIndex === 0) {
    return `${Math.round(value)} ${units[unitIndex]}`;
  }

  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

export function formatBitrate(bps: number): string {
  if (bps < 0) {
    return "0 bps";
  }

  const mbps = bps / 1_000_000;
  if (mbps >= 1) {
    return `${mbps.toFixed(1)} Mbps`;
  }

  const kbps = bps / 1_000;
  return `${kbps.toFixed(0)} kbps`;
}

export function formatResolution(w: number, h: number): string {
  return `${w}x${h}`;
}
