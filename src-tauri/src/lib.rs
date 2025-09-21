use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs;

#[derive(Debug, Serialize, Deserialize, Clone)]
struct LEDConfiguration {
    pages: Vec<LEDPage>,
    #[serde(flatten)]
    extra: Value,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct LEDPage {
    slot: u32,
    frames: Vec<LEDFrame>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct LEDFrame {
    #[serde(rename = "ledColors")]
    led_colors: Vec<String>,
    delay: u32,
}

#[derive(Debug, Serialize, Deserialize)]
struct MergeMapping {
    slot: u32,
    action: String,
    #[serde(rename = "sourceFile")]
    source_file: Option<String>,
    #[serde(rename = "targetSlot")]
    target_slot: Option<u32>,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn load_config(path: String) -> Result<LEDConfiguration, String> {
    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file: {}", e))?;
    
    let config: LEDConfiguration = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse JSON: {}", e))?;
    
    Ok(config)
}

#[tauri::command]
fn merge_configs(
    base_config: LEDConfiguration,
    mappings: Vec<MergeMapping>,
) -> Result<LEDConfiguration, String> {
    let mut merged_config = base_config.clone();
    
    for mapping in mappings {
        let page_index = merged_config.pages
            .iter()
            .position(|p| p.slot == mapping.slot);
        
        if let Some(idx) = page_index {
            match mapping.action.as_str() {
                "keep" => {
                    // Do nothing, keep the original
                },
                "replace" => {
                    if let Some(source_path) = mapping.source_file {
                        let source_content = fs::read_to_string(&source_path)
                            .map_err(|e| format!("Failed to read source file: {}", e))?;
                        let source_config: LEDConfiguration = serde_json::from_str(&source_content)
                            .map_err(|e| format!("Failed to parse source JSON: {}", e))?;
                        
                        if let Some(target_slot) = mapping.target_slot {
                            if let Some(source_page) = source_config.pages
                                .iter()
                                .find(|p| p.slot == target_slot) {
                                merged_config.pages[idx] = LEDPage {
                                    slot: mapping.slot,
                                    frames: source_page.frames.clone(),
                                };
                            }
                        } else {
                            // Replace with first page from source
                            if let Some(source_page) = source_config.pages.first() {
                                merged_config.pages[idx] = LEDPage {
                                    slot: mapping.slot,
                                    frames: source_page.frames.clone(),
                                };
                            }
                        }
                    }
                },
                "combine" => {
                    if let Some(source_path) = mapping.source_file {
                        let source_content = fs::read_to_string(&source_path)
                            .map_err(|e| format!("Failed to read source file: {}", e))?;
                        let source_config: LEDConfiguration = serde_json::from_str(&source_content)
                            .map_err(|e| format!("Failed to parse source JSON: {}", e))?;
                        
                        if let Some(target_slot) = mapping.target_slot {
                            if let Some(source_page) = source_config.pages
                                .iter()
                                .find(|p| p.slot == target_slot) {
                                // Combine frames from both configurations
                                let mut combined_frames = merged_config.pages[idx].frames.clone();
                                combined_frames.extend(source_page.frames.clone());
                                merged_config.pages[idx].frames = combined_frames;
                            }
                        }
                    }
                },
                _ => {}
            }
        }
    }
    
    Ok(merged_config)
}

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