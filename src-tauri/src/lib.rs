mod database;

use database::{tauri_bindings::*, RegulationsDB};
use std::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(DBState(Mutex::new(
            RegulationsDB::new("regulations.db").expect("Failed to init database"),
        )))
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_far_toc,
            get_aim_toc,
            search_far,
            search_aim,
            search_pcg,
            fetch_aim_metadata,
            get_section_manifest
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
