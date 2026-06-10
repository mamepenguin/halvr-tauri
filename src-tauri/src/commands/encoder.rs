use crate::models::EncoderInfo;
use crate::services::{detect_encoders, ffmpeg::find_ffmpeg};
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub async fn detect_available_encoders(
    state: State<'_, AppState>,
) -> Result<Vec<EncoderInfo>, String> {
    let ffmpeg_path = {
        let inner = state.0.lock().unwrap();
        inner.ffmpeg_path.clone()
    };

    let path = ffmpeg_path
        .or_else(find_ffmpeg)
        .ok_or_else(|| "ffmpeg not found".to_string())?;

    let encoders = detect_encoders(&path).await;

    {
        let mut inner = state.0.lock().unwrap();
        inner.available_encoders = encoders.clone();
        inner.ffmpeg_path = Some(path);
    }

    Ok(encoders)
}
