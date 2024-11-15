use std::{fs::read_dir, path::Path};

use super::Result;

// 读取文件夹下的所有文件名
pub fn read_dir_filer<P: AsRef<Path>>(path: P) -> Result<Vec<String>> {
    let mut arr: Vec<String> = vec![];
    for item in read_dir(path)? {
        if let Ok(item) = item {
            // 忽略内部文件夹
            if !item.path().is_dir() && !is_hidden(&item.path()) {
                continue;
            }
            let file_name = item.file_name().into_string().unwrap_or_default();
            if file_name.is_empty() {
                continue;
            }
            arr.push(file_name);
        }
    }
    Ok(arr)
}

// 是否为隐藏文件
pub fn is_hidden(path: &Path) -> bool {
    path.file_name()
        .unwrap_or_else(|| path.as_os_str())
        .to_str()
        .map_or(false, |s| s.starts_with("."))
}
