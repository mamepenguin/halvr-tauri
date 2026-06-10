use std::path::{Path, PathBuf};

const MAX_SUFFIX: u32 = 1000;

/// Resolves a unique output path for the HEVC-converted file.
///
/// The output filename follows the pattern `{base_name}_HEVC.mp4`.
/// If that file already exists, a numeric suffix is appended:
/// `{base_name}_HEVC_1.mp4`, `{base_name}_HEVC_2.mp4`, and so on
/// up to `MAX_SUFFIX`.
///
/// When `output_directory` is `Some`, the output is placed there
/// instead of the input file's parent directory.
pub fn resolve(input_path: &str, output_directory: Option<&str>) -> String {
    let input = Path::new(input_path);

    let directory: PathBuf = match output_directory {
        Some(dir) => PathBuf::from(dir),
        None => input
            .parent()
            .map(|p| p.to_path_buf())
            .unwrap_or_else(|| PathBuf::from(".")),
    };

    let base_name = input
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("output");

    let candidate = directory.join(format!("{base_name}_HEVC.mp4"));
    if !candidate.exists() {
        return path_to_string(&candidate);
    }

    for i in 1..=MAX_SUFFIX {
        let candidate = directory.join(format!("{base_name}_HEVC_{i}.mp4"));
        if !candidate.exists() {
            return path_to_string(&candidate);
        }
    }

    // Fallback: return the last attempted path even if it exists.
    path_to_string(&directory.join(format!("{base_name}_HEVC_{MAX_SUFFIX}.mp4")))
}

fn path_to_string(path: &Path) -> String {
    path.to_string_lossy().into_owned()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    #[test]
    fn basic_output_path() {
        let tmp = tempfile::tempdir().unwrap();
        let input = tmp.path().join("video.mp4");
        fs::write(&input, b"").unwrap();

        let result = resolve(input.to_str().unwrap(), None);
        assert!(result.ends_with("video_HEVC.mp4"));
    }

    #[test]
    fn deduplicates_when_file_exists() {
        let tmp = tempfile::tempdir().unwrap();
        let input = tmp.path().join("clip.mov");
        fs::write(&input, b"").unwrap();

        // Create the first output so it's "taken"
        let existing = tmp.path().join("clip_HEVC.mp4");
        fs::write(&existing, b"").unwrap();

        let result = resolve(input.to_str().unwrap(), None);
        assert!(result.ends_with("clip_HEVC_1.mp4"));
    }

    #[test]
    fn uses_output_directory_when_provided() {
        let tmp_in = tempfile::tempdir().unwrap();
        let tmp_out = tempfile::tempdir().unwrap();
        let input = tmp_in.path().join("movie.mkv");
        fs::write(&input, b"").unwrap();

        let result = resolve(input.to_str().unwrap(), Some(tmp_out.path().to_str().unwrap()));
        assert!(result.starts_with(tmp_out.path().to_str().unwrap()));
        assert!(result.ends_with("movie_HEVC.mp4"));
    }
}
