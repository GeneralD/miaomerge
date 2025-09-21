use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MergeMapping {
    pub slot: u32,
    pub action: String,
    #[serde(rename = "sourceFile")]
    pub source_file: Option<String>,
    #[serde(rename = "targetSlot")]
    pub target_slot: Option<u32>,
}

impl MergeMapping {
    pub fn new(slot: u32, action: String) -> Self {
        Self {
            slot,
            action,
            source_file: None,
            target_slot: None,
        }
    }

    pub fn with_source_file(mut self, source_file: String) -> Self {
        self.source_file = Some(source_file);
        self
    }

    pub fn with_target_slot(mut self, target_slot: u32) -> Self {
        self.target_slot = Some(target_slot);
        self
    }

    pub fn is_valid(&self) -> bool {
        match self.action.as_str() {
            "keep" => true,
            "replace" | "combine" => self.source_file.is_some(),
            _ => false,
        }
    }
}