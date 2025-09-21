use std::fs;
use crate::domain::{
    entity::LEDConfiguration,
    repository::ConfigurationRepository,
};

pub struct FileSystemRepository;

impl FileSystemRepository {
    pub fn new() -> Self {
        Self
    }
}

impl ConfigurationRepository for FileSystemRepository {
    fn load_configuration(&self, path: &str) -> Result<LEDConfiguration, String> {
        let content = fs::read_to_string(path)
            .map_err(|e| format!("Failed to read file: {}", e))?;
        
        let config: LEDConfiguration = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse JSON: {}", e))?;
        
        Ok(config)
    }

    fn save_configuration(&self, config: &LEDConfiguration, path: &str) -> Result<(), String> {
        let content = serde_json::to_string_pretty(config)
            .map_err(|e| format!("Failed to serialize JSON: {}", e))?;
        
        fs::write(path, content)
            .map_err(|e| format!("Failed to write file: {}", e))?;
        
        Ok(())
    }
}