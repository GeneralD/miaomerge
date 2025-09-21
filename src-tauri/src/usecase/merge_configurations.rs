use crate::domain::{
    entity::{LEDConfiguration, MergeMapping},
    repository::ConfigurationRepository,
};

pub struct MergeConfigurationsUseCase<R: ConfigurationRepository> {
    repository: R,
}

impl<R: ConfigurationRepository> MergeConfigurationsUseCase<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub fn execute(
        &self,
        mut base_config: LEDConfiguration,
        mappings: Vec<MergeMapping>,
    ) -> Result<LEDConfiguration, String> {
        for mapping in mappings {
            if !mapping.is_valid() {
                return Err(format!("Invalid mapping for slot {}", mapping.slot));
            }

            match mapping.action.as_str() {
                "keep" => {
                    // Do nothing
                }
                "replace" | "combine" => {
                    if let Some(source_path) = &mapping.source_file {
                        let source_config = self.repository.load_configuration(source_path)?;
                        
                        let source_page = if let Some(target_slot) = mapping.target_slot {
                            source_config.get_page_by_index(target_slot)
                        } else {
                            source_config.page_data.first()
                        };

                        if let Some(source_page) = source_page {
                            base_config.merge_page(mapping.slot, source_page, &mapping.action)?;
                        }
                    }
                }
                _ => return Err(format!("Unknown action: {}", mapping.action)),
            }
        }

        Ok(base_config)
    }
}