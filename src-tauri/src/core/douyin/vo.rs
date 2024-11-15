#[derive(Debug, serde::Serialize)]
pub struct UserResp {
    pub uid: String,
    pub avatar: String,
    pub nickname: String,
    pub source: String,
    pub video_count: u64,
}

#[derive(Debug, serde::Serialize)]
pub struct VideoResp {
    pub list: Vec<Video>,
    pub has_more: u64,
    pub max_cursor: u64,
}

#[derive(Debug, serde::Serialize)]
pub struct Video {
    pub id: String,
    pub url: String,
    pub title: String,
    pub desc: String,
    pub ratio: String,
    pub cover: String,
    pub nickname: String,
    pub is_top: u64,
    pub likes: u64,
    pub duration: u64,
    pub total_count: u64,
    pub create_time: u64,
}
