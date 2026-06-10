use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum EncoderType {
    HevcVideotoolbox,
    HevcNvenc,
    HevcQsv,
    Libx265,
}

impl EncoderType {
    pub fn ffmpeg_codec(&self) -> &str {
        match self {
            EncoderType::HevcVideotoolbox => "hevc_videotoolbox",
            EncoderType::HevcNvenc => "hevc_nvenc",
            EncoderType::HevcQsv => "hevc_qsv",
            EncoderType::Libx265 => "libx265",
        }
    }

    pub fn display_name(&self) -> &str {
        match self {
            EncoderType::HevcVideotoolbox => "VideoToolbox (Hardware)",
            EncoderType::HevcNvenc => "NVENC (Hardware)",
            EncoderType::HevcQsv => "Quick Sync (Hardware)",
            EncoderType::Libx265 => "libx265 (Software)",
        }
    }

    pub fn is_hardware(&self) -> bool {
        match self {
            EncoderType::HevcVideotoolbox | EncoderType::HevcNvenc | EncoderType::HevcQsv => true,
            EncoderType::Libx265 => false,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum ExportPreset {
    HighQuality,
    Standard,
    SmallSize,
}

impl ExportPreset {
    pub fn quality_args(&self, encoder: &EncoderType) -> Vec<String> {
        match encoder {
            EncoderType::HevcVideotoolbox => {
                let q_value = match self {
                    ExportPreset::HighQuality => "78",
                    ExportPreset::Standard => "65",
                    ExportPreset::SmallSize => "55",
                };
                vec!["-q:v".to_string(), q_value.to_string()]
            }
            EncoderType::Libx265 => {
                let crf = match self {
                    ExportPreset::HighQuality => "23",
                    ExportPreset::Standard => "28",
                    ExportPreset::SmallSize => "32",
                };
                vec![
                    "-crf".to_string(),
                    crf.to_string(),
                    "-preset".to_string(),
                    "medium".to_string(),
                ]
            }
            EncoderType::HevcNvenc => {
                let (preset, cq) = match self {
                    ExportPreset::HighQuality => ("p7", "20"),
                    ExportPreset::Standard => ("p5", "26"),
                    ExportPreset::SmallSize => ("p4", "32"),
                };
                vec![
                    "-preset".to_string(),
                    preset.to_string(),
                    "-cq".to_string(),
                    cq.to_string(),
                ]
            }
            EncoderType::HevcQsv => {
                let (preset, quality) = match self {
                    ExportPreset::HighQuality => ("veryslow", "22"),
                    ExportPreset::Standard => ("medium", "28"),
                    ExportPreset::SmallSize => ("veryfast", "33"),
                };
                vec![
                    "-preset".to_string(),
                    preset.to_string(),
                    "-global_quality".to_string(),
                    quality.to_string(),
                ]
            }
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ConversionSettings {
    pub preset: ExportPreset,
    pub encoder: EncoderType,
    pub preserve_timestamp: bool,
}

impl Default for ConversionSettings {
    fn default() -> Self {
        Self {
            preset: ExportPreset::HighQuality,
            encoder: EncoderType::Libx265,
            preserve_timestamp: true,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct EncoderInfo {
    pub id: EncoderType,
    pub name: String,
    pub is_hardware: bool,
}
