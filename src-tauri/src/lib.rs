mod commands;
mod events;
mod models;
mod services;
mod state;

use state::AppState;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![
            commands::conversion::start_conversion,
            commands::conversion::add_to_queue,
            commands::conversion::cancel_conversion,
            commands::conversion::remove_item,
            commands::conversion::clear_completed,
            commands::conversion::get_queue,
            commands::encoder::detect_available_encoders,
            commands::metadata::get_metadata,
            commands::files::validate_files,
            commands::files::get_supported_extensions,
            commands::files::reveal_in_folder,
            commands::settings::load_settings,
            commands::settings::save_settings,
            commands::platform::get_platform,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Halvr");
}
