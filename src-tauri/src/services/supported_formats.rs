const SUPPORTED_EXTENSIONS: &[&str] = &[
    "mp4", "mov", "m4v", "m2ts", "ts", "mkv", "avi", "wmv", "webm",
];

/// Returns the list of video file extensions accepted by Halvr.
pub fn supported_extensions() -> &'static [&'static str] {
    SUPPORTED_EXTENSIONS
}

/// Checks whether the file at `path` has a supported video extension.
pub fn is_supported(path: &str) -> bool {
    std::path::Path::new(path)
        .extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| SUPPORTED_EXTENSIONS.contains(&ext.to_lowercase().as_str()))
        .unwrap_or(false)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_supported_extensions() {
        assert!(is_supported("/tmp/video.mp4"));
        assert!(is_supported("/tmp/video.MOV"));
        assert!(is_supported("/tmp/video.M2TS"));
        assert!(is_supported("file.webm"));
    }

    #[test]
    fn rejects_unsupported_extensions() {
        assert!(!is_supported("/tmp/image.png"));
        assert!(!is_supported("/tmp/audio.mp3"));
        assert!(!is_supported("no_extension"));
        assert!(!is_supported(""));
    }

    #[test]
    fn extension_list_is_not_empty() {
        assert!(!supported_extensions().is_empty());
    }
}
