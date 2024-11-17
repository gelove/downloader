use std::fs::read_to_string;
use std::path::{Path, PathBuf};
use std::vec;

use walkdir::WalkDir;

use crate::common::vo::VideoToBeUploaded;
use crate::common::{error::CustomErr, file, Result};
use crate::config;

#[tracing::instrument]
pub fn get_config_str() -> String {
    let cfg = config::CONFIG.read();
    cfg.to_string()
}

#[tracing::instrument]
pub fn get_config() -> config::AppConfig {
    let cfg = config::CONFIG.read();
    cfg.clone()
}

#[tracing::instrument]
pub fn set_config(content: &str, config_dir: PathBuf) -> Result<()> {
    let config_path = config_dir.join("config.toml");
    // 验证是否为合法的toml格式 更新配置并持久化
    config::update(content, Some(config_path))
}

#[tracing::instrument]
pub fn generate_new_filename(path: &str) -> String {
    let path = Path::new(path);

    // 获取文件的目录、文件名和扩展名
    let parent = path.parent().unwrap_or(Path::new(""));
    let file_name = path.file_stem().unwrap_or_default();
    let extension = path.extension().unwrap_or_default();

    // 生成基础文件名
    let mut new_name = file_name.to_os_string();
    let mut count = 1;

    // 构造新的文件名，并检查是否存在
    let mut new_file = Path::new(parent)
        .join(new_name.clone())
        .with_extension(extension);

    while new_file.exists() {
        // 如果文件已存在，增加数字后缀
        new_name.push(format!("({})", count));
        new_file = Path::new(parent)
            .join(new_name.clone())
            .with_extension(extension);
        count += 1;
    }

    new_file.to_string_lossy().to_string()
}

// 获取目录下所有的视频信息
#[tracing::instrument]
pub fn get_videos_to_upload(dirname: &str) -> Result<Vec<VideoToBeUploaded>> {
    let walker = WalkDir::new(dirname).sort_by_file_name().into_iter();
    let mut dir = "".to_string();
    let mut dirs: Vec<String> = vec![];
    let mut video = VideoToBeUploaded::default();
    // let mut videos = VideosToBeUploaded { list: vec![] };
    let mut videos: Vec<VideoToBeUploaded> = vec![];
    for entry in walker.filter_entry(|e| !file::is_hidden(e.path())) {
        let entry = entry?;
        let path = entry.path();
        if path.is_dir() {
            // println!("dir path => {}", path.display());
            if dir != "" && video.filename != "" {
                dirs.push(dir.clone());
                videos.push(video);
                video = VideoToBeUploaded::default();
            }
            dir = path
                .to_str()
                .ok_or(CustomErr::PathError(path.to_path_buf()))?
                .to_string();
            continue;
        }
        // println!("file path => {}", path.display());
        let ext = path
            .extension()
            .ok_or(CustomErr::ExtensionError(path.to_path_buf()))?;
        let basename = path
            .file_stem()
            .ok_or(CustomErr::FileNameError(path.to_path_buf()))?;
        let filepath = path
            .to_str()
            .ok_or(CustomErr::PathError(path.to_path_buf()))?
            .to_string();
        if path.starts_with(&dir) && ext == "srt" && basename != "original" {
            video.captions.push(filepath);
            continue;
        }
        if path.starts_with(&dir) && ext == "mp4" {
            video.filename = filepath;
            continue;
        }
        if path.starts_with(&dir) && ext == "txt" && basename == "title" {
            let contents = read_to_string(path)?;
            video.title = contents;
            continue;
        }
    }
    if !dirs.contains(&dir) && video.filename != "" {
        videos.push(video);
    }
    // println!("dirs => {:?}", dirs);
    Ok(videos)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_videos_to_upload() {
        let videos = get_videos_to_upload("/Users/allen/Downloads/videos");
        println!("videos => {:?}", videos);
    }

    #[test]
    fn test_generate_new_filename() {
        let original_path = "/Users/allen/Downloads/鹅国宇哥/7430375084994415887.mp4";
        let new_path = generate_new_filename(original_path);
        println!("New file name: {}", new_path);
    }
}
