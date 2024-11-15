use std::fmt::Display;
use std::path::PathBuf;
use std::sync::Arc;

use lazy_static::lazy_static;
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};

use crate::common::Result;

// pub static CONTEXT: LazyLock<ServiceContext> = LazyLock::new(|| ServiceContext::default());

lazy_static! {
    pub static ref CONFIG: Arc<RwLock<AppConfig>> = Arc::new(RwLock::new(AppConfig::default()));
}

/// 更新配置并持久化
/// content 更新内容
/// save_path 不为 None 则持久化, 反之忽略
pub fn update(content: &str, save_path: Option<PathBuf>) -> Result<()> {
    // tracing::info!("update config ({:?}): {}", save_path, content);
    let cfg = toml::from_str::<AppConfig>(content)?;
    if let Some(path) = save_path {
        std::fs::write(path, content)?;
    }
    cfg.update()
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct AppConfig {
    pub app: App,
    pub douyin: Douyin,
    pub tiktok: Tiktok,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct App {
    pub download_dir: String,
}

impl AppConfig {
    pub fn update(&self) -> Result<()> {
        let mut cfg = CONFIG.write();
        cfg.clone_from(self);
        // tracing::info!("update config to: {:#?}", cfg);
        Ok(())
    }
}

impl Display for AppConfig {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Douyin {
    pub cookie: String,
    pub max_connections: u64,
    pub max_counts: u64,
    pub max_retries: u64,
    pub max_tasks: u64,
    pub page_counts: u64,
    pub timeout: u64,
    pub lyric: String,
    pub interval: String,
    pub headers: Headers,
    pub proxies: Proxies,
    pub model: Model,
    pub ms_token: MsToken,
    pub ttwid: Ttwid,
    pub webid: WebId,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Headers {
    pub user_agent: String,
    pub referer: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Proxies {
    pub http: String,
    pub https: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Model {
    pub version: Version,
    pub browser: Browser,
    pub engine: Engine,
    pub os: Os,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Version {
    pub code: String,
    pub name: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Browser {
    pub language: String,
    pub platform: String,
    pub name: String,
    pub version: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Engine {
    pub name: String,
    pub version: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Os {
    pub name: String,
    pub version: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct MsToken {
    pub url: String,
    pub magic: u64,
    pub version: u64,
    pub data_type: u64,
    pub str_data: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Ttwid {
    pub url: String,
    pub data: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct WebId {
    pub url: String,
    pub body: WebIdBody,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct WebIdBody {
    pub app_id: u64,
    pub referer: String,
    pub url: String,
    pub user_agent: String,
    pub user_unique_id: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Tiktok {
    pub cookie: String,
    pub max_connections: u64,
    pub max_counts: u64,
    pub max_retries: u64,
    pub max_tasks: u64,
    pub page_counts: u64,
    pub timeout: u64,
    pub interval: String,
}
