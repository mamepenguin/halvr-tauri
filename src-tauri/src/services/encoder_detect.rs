use crate::models::{EncoderInfo, EncoderType};
use tokio::process::Command;

/// Known HEVC encoders and their corresponding `EncoderType` variants.
const KNOWN_ENCODERS: &[(&str, EncoderType)] = &[
    ("hevc_videotoolbox", EncoderType::HevcVideotoolbox),
    ("hevc_nvenc", EncoderType::HevcNvenc),
    ("hevc_qsv", EncoderType::HevcQsv),
    ("libx265", EncoderType::Libx265),
];

/// Queries ffmpeg for available HEVC encoders and returns their metadata.
///
/// Returns an empty `Vec` if ffmpeg cannot be executed or produces no
/// recognisable encoder names.
pub async fn detect_encoders(ffmpeg_path: &str) -> Vec<EncoderInfo> {
    let output = match Command::new(ffmpeg_path)
        .args(["-encoders"])
        .output()
        .await
    {
        Ok(o) => o,
        Err(_) => return Vec::new(),
    };

    let stdout = String::from_utf8_lossy(&output.stdout);

    KNOWN_ENCODERS
        .iter()
        .filter(|(name, _)| encoder_listed(&stdout, name))
        .map(|(_, encoder_type)| EncoderInfo {
            name: encoder_type.display_name().to_string(),
            is_hardware: encoder_type.is_hardware(),
            id: encoder_type.clone(),
        })
        .collect()
}

/// Checks whether `encoder_name` appears as a token in the ffmpeg
/// `-encoders` output. Each encoder line typically looks like:
///   ` V..... hevc_videotoolbox  ...`
fn encoder_listed(stdout: &str, encoder_name: &str) -> bool {
    stdout.lines().any(|line| {
        line.split_whitespace()
            .any(|token| token == encoder_name)
    })
}
