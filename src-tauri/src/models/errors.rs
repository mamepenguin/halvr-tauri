use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error, Serialize, Clone)]
pub enum ConversionError {
    #[error("Input file is not readable")]
    InputFileNotReadable,

    #[error("No video track found in the input file")]
    NoVideoTrack,

    #[error("Export failed: {0}")]
    ExportFailed(String),

    #[error("File is already encoded with HEVC")]
    AlreadyHevc,

    #[error("Conversion was cancelled")]
    Cancelled,

    #[error("ffmpeg not found")]
    FfmpegNotFound,

    #[error("ffprobe not found")]
    FfprobeNotFound,
}

impl From<ConversionError> for String {
    fn from(error: ConversionError) -> Self {
        error.to_string()
    }
}
