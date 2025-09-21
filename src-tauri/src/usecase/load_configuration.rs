use crate::domain::{
    entity::LEDConfiguration,
    repository::ConfigurationRepository,
};

pub struct LoadConfigurationUseCase<R: ConfigurationRepository> {
    repository: R,
}

impl<R: ConfigurationRepository> LoadConfigurationUseCase<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub fn execute(&self, path: &str) -> Result<LEDConfiguration, String> {
        self.repository.load_configuration(path)
    }
}