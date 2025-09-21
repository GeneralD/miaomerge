use crate::domain::entity::LEDConfiguration;

pub trait ConfigurationRepository {
    fn load_configuration(&self, path: &str) -> Result<LEDConfiguration, String>;
    fn save_configuration(&self, config: &LEDConfiguration, path: &str) -> Result<(), String>;
}