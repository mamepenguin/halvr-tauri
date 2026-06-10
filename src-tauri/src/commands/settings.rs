use crate::models::ConversionSettings;
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub fn load_settings(state: State<'_, AppState>) -> ConversionSettings {
    let inner = state.0.lock().unwrap();
    inner.settings.clone()
}

#[tauri::command]
pub fn save_settings(state: State<'_, AppState>, settings: ConversionSettings) {
    let mut inner = state.0.lock().unwrap();
    inner.settings = settings;
}
