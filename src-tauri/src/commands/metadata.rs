use crate::models::VideoMetadata;
use crate::services::{ffmpeg::find_ffprobe, read_metadata};
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub async fn get_metadata(
    state: State<'_, AppState>,
    path: String,
) -> Result<VideoMetadata, String> {
    let ffprobe_path = {
        let inner = state.0.lock().unwrap();
        inner.ffprobe_path.clone()
    };

    let probe_path = ffprobe_path
        .or_else(find_ffprobe)
        .ok_or_else(|| "ffprobe not found".to_string())?;

    {
        let mut inner = state.0.lock().unwrap();
        if inner.ffprobe_path.is_none() {
            inner.ffprobe_path = Some(probe_path.clone());
        }
    }

    read_metadata(&probe_path, &path)
        .await
        .map_err(|e| e.to_string())
}
