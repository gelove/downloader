use serde::{Deserialize, Serialize};

// use super::TokenManager;
use crate::config::CONFIG;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct UserDto {
    pub sec_user_id: String,
    #[serde(flatten)]
    pub base: BaseDto,
}

impl UserDto {
    pub fn new(base: BaseDto, sec_user_id: String) -> Self {
        Self { sec_user_id, base }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct VideosDto {
    pub sec_user_id: String,
    pub count: u64,
    pub max_cursor: u64,
    #[serde(flatten)]
    pub base: BaseDto,
}

impl VideosDto {
    pub fn new(base: BaseDto, sec_user_id: String, count: u64, max_cursor: u64) -> Self {
        Self {
            sec_user_id,
            count,
            max_cursor,
            base,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BaseDto {
    pub device_platform: String,
    pub aid: String,
    pub channel: String,
    pub pc_client_type: i32,
    pub version_code: String,
    pub version_name: String,
    pub cookie_enabled: String,
    pub screen_width: i32,
    pub screen_height: i32,
    pub browser_language: String,
    pub browser_platform: String,
    pub browser_name: String,
    pub browser_version: String,
    pub browser_online: String,
    pub engine_name: String,
    pub engine_version: String,
    pub os_name: String,
    pub os_version: String,
    pub cpu_core_num: i32,
    pub device_memory: i32,
    pub platform: String,
    pub downlink: i32,
    pub effective_type: String,
    pub round_trip_time: i32,
    pub ms_token: String,
}

impl Default for BaseDto {
    fn default() -> Self {
        let cfg = CONFIG.read();
        Self {
            device_platform: "webapp".to_string(),
            aid: "6383".to_string(),
            channel: "channel_pc_web".to_string(),
            pc_client_type: 1,
            version_code: cfg.douyin.model.version.code.clone(),
            version_name: cfg.douyin.model.version.name.clone(),
            cookie_enabled: "true".to_string(),
            screen_width: 1920,
            screen_height: 1080,
            browser_language: cfg.douyin.model.browser.language.clone(),
            browser_platform: cfg.douyin.model.browser.platform.clone(),
            browser_name: cfg.douyin.model.browser.name.clone(),
            browser_version: cfg.douyin.model.browser.version.clone(),
            browser_online: "true".to_string(),
            engine_name: cfg.douyin.model.engine.name.clone(),
            engine_version: cfg.douyin.model.engine.version.clone(),
            os_name: cfg.douyin.model.os.name.clone(),
            os_version: cfg.douyin.model.os.version.clone(),
            cpu_core_num: 12,
            device_memory: 8,
            platform: "PC".to_string(),
            downlink: 10,
            effective_type: "4g".to_string(),
            round_trip_time: 100,
            ms_token: "".to_string(),
        }
    }
}

impl BaseDto {
    pub fn new(ms_token: String) -> Self {
        let mut base = BaseDto::default();
        base.ms_token = ms_token;
        base
    }
}
