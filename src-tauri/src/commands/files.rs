use crate::services::{is_supported, supported_extensions};

#[tauri::command]
pub fn validate_files(paths: Vec<String>) -> Vec<FileValidation> {
    paths
        .into_iter()
        .map(|path| {
            let supported = is_supported(&path);
            let filename = std::path::Path::new(&path)
                .file_name()
                .map(|n| n.to_string_lossy().to_string())
                .unwrap_or_default();
            FileValidation {
                path,
                filename,
                supported,
            }
        })
        .collect()
}

#[tauri::command]
pub fn get_supported_extensions() -> Vec<String> {
    supported_extensions()
        .iter()
        .map(|s| s.to_string())
        .collect()
}

#[tauri::command]
pub fn reveal_in_folder(path: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .args(["-R", &path])
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .args(["/select,", &path])
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "linux")]
    {
        let parent = std::path::Path::new(&path)
            .parent()
            .map(|p| p.to_string_lossy().to_string())
            .unwrap_or_else(|| path.clone());
        std::process::Command::new("xdg-open")
            .arg(&parent)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FileValidation {
    pub path: String,
    pub filename: String,
    pub supported: bool,
}
