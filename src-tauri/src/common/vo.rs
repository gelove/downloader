#[derive(Clone, Debug, serde::Serialize)]
pub struct DownloadProgress {
    pub current: u64,
    pub total: u64,
    pub id: String,
}

#[derive(Debug, serde::Serialize)]
pub struct VideosToBeUploaded {
    pub list: Vec<VideoToBeUploaded>,
}

#[derive(Debug, Clone, Default, serde::Serialize)]
pub struct VideoToBeUploaded {
    pub title: String,
    pub filename: String,
    pub captions: Vec<String>,
}
