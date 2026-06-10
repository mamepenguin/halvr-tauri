use crate::models::{ConversionError, VideoMetadata};
use serde_json::Value;
use tokio::process::Command;

/// Reads video metadata by invoking ffprobe and parsing its JSON output.
pub async fn read_metadata(
    ffprobe_path: &str,
    input_path: &str,
) -> Result<VideoMetadata, ConversionError> {
    let output = Command::new(ffprobe_path)
        .args([
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            input_path,
        ])
        .output()
        .await
        .map_err(|e| ConversionError::ExportFailed(format!("Failed to run ffprobe: {e}")))?;

    if !output.status.success() {
        return Err(ConversionError::InputFileNotReadable);
    }

    let json: Value = serde_json::from_slice(&output.stdout)
        .map_err(|e| ConversionError::ExportFailed(format!("Failed to parse ffprobe output: {e}")))?;

    let video_stream = find_video_stream(&json)
        .ok_or(ConversionError::NoVideoTrack)?;

    let width = parse_u32(video_stream, "width").unwrap_or(0);
    let height = parse_u32(video_stream, "height").unwrap_or(0);
    let codec = video_stream
        .get("codec_name")
        .and_then(|v| v.as_str())
        .unwrap_or("unknown")
        .to_string();

    let is_already_hevc = matches!(codec.as_str(), "hevc" | "h265");

    let duration_secs = parse_duration(&json, video_stream);
    let file_size = parse_file_size(&json, input_path);
    let bitrate = parse_bitrate(video_stream, &json, file_size, duration_secs);

    Ok(VideoMetadata {
        duration_secs,
        width,
        height,
        codec,
        file_size,
        bitrate,
        is_already_hevc,
    })
}

/// Locates the first video stream in the ffprobe JSON output.
fn find_video_stream(json: &Value) -> Option<&Value> {
    json.get("streams")?
        .as_array()?
        .iter()
        .find(|s| s.get("codec_type").and_then(|v| v.as_str()) == Some("video"))
}

/// Extracts duration in seconds, trying multiple sources.
fn parse_duration(json: &Value, video_stream: &Value) -> f64 {
    // 1. stream duration
    if let Some(d) = parse_f64_str(video_stream, "duration") {
        if d > 0.0 {
            return d;
        }
    }

    // 2. format duration
    if let Some(format) = json.get("format") {
        if let Some(d) = parse_f64_str(format, "duration") {
            if d > 0.0 {
                return d;
            }
        }
    }

    0.0
}

/// Gets file size from format.size or falls back to filesystem metadata.
fn parse_file_size(json: &Value, input_path: &str) -> u64 {
    if let Some(format) = json.get("format") {
        if let Some(size) = parse_u64_str(format, "size") {
            return size;
        }
    }

    std::fs::metadata(input_path)
        .map(|m| m.len())
        .unwrap_or(0)
}

/// Extracts bitrate, preferring the stream value, with a calculated fallback.
fn parse_bitrate(stream: &Value, json: &Value, file_size: u64, duration_secs: f64) -> u64 {
    // 1. stream bit_rate
    if let Some(br) = parse_u64_str(stream, "bit_rate") {
        if br > 0 {
            return br;
        }
    }

    // 2. format bit_rate
    if let Some(format) = json.get("format") {
        if let Some(br) = parse_u64_str(format, "bit_rate") {
            if br > 0 {
                return br;
            }
        }
    }

    // 3. calculated: (file_size_bytes * 8) / duration_secs
    if duration_secs > 0.0 {
        return ((file_size as f64 * 8.0) / duration_secs) as u64;
    }

    0
}

fn parse_u32(value: &Value, key: &str) -> Option<u32> {
    value.get(key).and_then(|v| {
        v.as_u64().map(|n| n as u32)
            .or_else(|| v.as_str().and_then(|s| s.parse().ok()))
    })
}

fn parse_f64_str(value: &Value, key: &str) -> Option<f64> {
    value.get(key).and_then(|v| {
        v.as_f64()
            .or_else(|| v.as_str().and_then(|s| s.parse().ok()))
    })
}

fn parse_u64_str(value: &Value, key: &str) -> Option<u64> {
    value.get(key).and_then(|v| {
        v.as_u64()
            .or_else(|| v.as_str().and_then(|s| s.parse().ok()))
    })
}
