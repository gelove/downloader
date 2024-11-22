use tauri::{AppHandle, Emitter, Window};

use crate::common::vo::DownloadProgress;
use crate::common::Result;
use crate::core::douyin::api;
use crate::core::douyin::vo::{UserResp, VideoResp};

// 取用户信息
#[tauri::command]
pub async fn get_user(uid: &str) -> Result<UserResp> {
    api::get_user(uid).await
}

// 取用户下的所有个人视频
#[tauri::command]
pub async fn get_videos_by_uid(uid: &str, count: u64, max_cursor: u64) -> Result<VideoResp> {
    api::get_videos_by_uid(uid, count, max_cursor).await
}

// 取用户信息 无需cookie
#[tauri::command]
pub async fn get_user_by_ies(uid: &str) -> Result<UserResp> {
    api::get_user_by_ies(uid).await
}

// 视频下载
// #[tauri::command(rename_all = "snake_case")]
#[tauri::command]
pub async fn download(
    _handle: AppHandle,
    window: Window,
    id: &str,
    url: &str,
    title: &str,
    tags: &str,
    file_name: &str,
    save_path: &str,
) -> Result<String> {
    let save = api::CallBackClosure(move |current: u64, res_len: u64| -> Result<()> {
        window.emit_to(
            "main",
            "e_download_progress",
            DownloadProgress {
                current,
                total: res_len,
                id: id.into(),
            },
        )?;
        Ok(())
    });
    api::download(url, title, tags, file_name, save_path, save).await
}
