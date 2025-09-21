mod domain;
mod usecase;
mod infrastructure;
mod presentation;

use presentation::{greet, load_config, merge_configs};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![greet, load_config, merge_configs])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}