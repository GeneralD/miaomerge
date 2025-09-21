use crate::{
    domain::entity::{LEDConfiguration, MergeMapping},
    usecase::{LoadConfigurationUseCase, MergeConfigurationsUseCase},
    infrastructure::FileSystemRepository,
};

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
pub fn load_config(path: String) -> Result<LEDConfiguration, String> {
    let repository = FileSystemRepository::new();
    let use_case = LoadConfigurationUseCase::new(repository);
    use_case.execute(&path)
}

#[tauri::command]
pub fn merge_configs(
    base_config: LEDConfiguration,
    mappings: Vec<MergeMapping>,
) -> Result<LEDConfiguration, String> {
    let repository = FileSystemRepository::new();
    let use_case = MergeConfigurationsUseCase::new(repository);
    use_case.execute(base_config, mappings)
}