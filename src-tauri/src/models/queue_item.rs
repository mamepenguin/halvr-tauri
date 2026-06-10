use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ErrorInfo {
    pub title: String,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum QueueItemStatus {
    Pending,
    #[serde(rename_all = "camelCase")]
    Converting { progress: f64 },
    #[serde(rename_all = "camelCase")]
    Completed { output_path: String },
    Skipped { error: ErrorInfo },
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct QueueItem {
    pub id: String,
    pub input_path: String,
    pub filename: String,
    pub status: QueueItemStatus,
}

impl QueueItem {
    pub fn new(input_path: String, filename: String) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            input_path,
            filename,
            status: QueueItemStatus::Pending,
        }
    }
}
