use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LEDConfiguration {
    pub product_info: Value,
    pub page_num: u32,
    pub page_data: Vec<PageData>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PageData {
    #[serde(deserialize_with = "deserialize_flexible_number")]
    pub valid: u32,
    pub page_index: u32,
    pub lightness: u32,
    pub speed_ms: u32,
    pub color: Value,
    pub word_page: Value,
    pub frames: FramesData,
    pub keyframes: Value,
    #[serde(rename = "//")]
    pub comment: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FramesData {
    pub valid: Option<u32>,
    pub frame_num: Option<u32>,
    pub frame_data: Vec<FrameData>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FrameData {
    #[serde(deserialize_with = "deserialize_flexible_number")]
    pub frame_index: u32,
    #[serde(rename = "frame_RGB")]
    pub frame_rgb: Vec<String>,
}

fn deserialize_flexible_number<'de, D>(deserializer: D) -> Result<u32, D::Error>
where
    D: serde::Deserializer<'de>,
{
    use serde::de::{self, Visitor};
    use std::fmt;

    struct FlexibleNumberVisitor;

    impl<'de> Visitor<'de> for FlexibleNumberVisitor {
        type Value = u32;

        fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
            formatter.write_str("a number or string that can be parsed as u32")
        }

        fn visit_u64<E>(self, value: u64) -> Result<Self::Value, E>
        where
            E: de::Error,
        {
            if value <= u32::MAX as u64 {
                Ok(value as u32)
            } else {
                Err(E::custom(format!("number {} is too large for u32", value)))
            }
        }

        fn visit_str<E>(self, value: &str) -> Result<Self::Value, E>
        where
            E: de::Error,
        {
            value.parse().map_err(de::Error::custom)
        }

        fn visit_bool<E>(self, value: bool) -> Result<Self::Value, E>
        where
            E: de::Error,
        {
            Ok(if value { 1 } else { 0 })
        }
    }

    deserializer.deserialize_any(FlexibleNumberVisitor)
}


impl LEDConfiguration {
    pub fn get_page_by_index(&self, page_index: u32) -> Option<&PageData> {
        self.page_data.iter().find(|page| page.page_index == page_index)
    }

    pub fn merge_page(&mut self, target_index: u32, source_page: &PageData, action: &str) -> Result<(), String> {
        let page_index = self.page_data
            .iter()
            .position(|p| p.page_index == target_index)
            .ok_or("Target page not found")?;

        match action {
            "keep" => {
                // Do nothing
            }
            "replace" => {
                self.page_data[page_index].frames = source_page.frames.clone();
            }
            "combine" => {
                let mut combined_frames = self.page_data[page_index].frames.frame_data.clone();
                combined_frames.extend(source_page.frames.frame_data.clone());
                let frame_count = combined_frames.len() as u32;
                self.page_data[page_index].frames.frame_data = combined_frames;
                self.page_data[page_index].frames.frame_num = Some(frame_count);
            }
            _ => return Err(format!("Unknown action: {}", action)),
        }

        Ok(())
    }
}