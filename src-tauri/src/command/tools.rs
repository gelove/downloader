use sysinfo::{Components, Disks, Networks, System};
use tauri::{AppHandle, Manager, Window};

use crate::common::error::CustomErr;
use crate::common::vo::VideoToBeUploaded;
use crate::common::Result;
use crate::config::AppConfig;
use crate::core::tools;

/// 获取当前程序的版本号
/// Tauri 会根据 Cargo.toml 中的 version 字段提供版本信息
#[tauri::command]
pub fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
pub fn get_system_info() {
    // Please note that we use "new_all" to ensure that all lists of
    // CPUs and processes are filled!
    let mut sys = System::new_all();

    // First we update all information of our `System` struct.
    sys.refresh_all();

    println!("=> system:");
    // RAM and swap information:
    println!("total memory: {} bytes", sys.total_memory());
    println!("used memory : {} bytes", sys.used_memory());
    println!("total swap  : {} bytes", sys.total_swap());
    println!("used swap   : {} bytes", sys.used_swap());

    // Display system information:
    println!("System name:             {:?}", System::name());
    println!("System kernel version:   {:?}", System::kernel_version());
    println!("System OS version:       {:?}", System::os_version());
    println!("System host name:        {:?}", System::host_name());

    // Number of CPUs:
    println!("NB CPUs: {}", sys.cpus().len());

    // Display processes ID, name na disk usage:
    // for (pid, process) in sys.processes() {
    //     println!("[{pid}] {:?} {:?}", process.name(), process.disk_usage());
    // }

    // We display all disks' information:
    println!("=> disks:");
    let disks = Disks::new_with_refreshed_list();
    for disk in &disks {
        println!("{disk:?}");
    }

    // Network interfaces name, total data received and total data transmitted:
    let networks = Networks::new_with_refreshed_list();
    println!("=> networks:");
    for (interface_name, data) in &networks {
        println!(
            "{interface_name}: {} B (down) / {} B (up)",
            data.total_received(),
            data.total_transmitted(),
        );
        // If you want the amount of data received/transmitted since last call
        // to `Networks::refresh`, use `received`/`transmitted`.
    }

    // Components temperature:
    let components = Components::new_with_refreshed_list();
    println!("=> components:");
    for component in &components {
        println!("{component:?}");
    }
}

/// 关闭开屏界面，并打开主界面（通常在关闭之前初始化）
#[tauri::command]
pub fn close_splashscreen(window: Window, _handle: AppHandle) -> Result<()> {
    tracing::info!("close_splashscreen");
    if let Some(splashscreen) = window.get_webview_window("splashscreen") {
        // tracing::info!("close splashscreen");
        splashscreen.close()?;
    }
    window
        .get_webview_window("main")
        // .ok_or(CustomErr::WindowNotFound(std::backtrace::Backtrace::capture()))?
        .ok_or(CustomErr::WindowNotFound)?
        .show()?;
    Ok(())
}

#[tauri::command]
pub fn get_config(_window: Window, _handle: AppHandle) -> AppConfig {
    tools::get_config()
}

#[tauri::command]
pub fn set_config(_window: Window, handle: AppHandle, content: &str) -> Result<()> {
    let resolver = handle.path();
    let config_dir = resolver.app_config_dir().unwrap_or_default();
    tools::set_config(content, config_dir)
}

/// 获取不重复的输出路径
#[tauri::command]
pub fn get_output_filepath(_handle: AppHandle, dest: &str) -> String {
    tools::generate_new_filename(dest)
}

// 获取目录下所有的视频信息
#[tauri::command]
pub fn get_videos_to_upload(dirname: &str) -> Result<Vec<VideoToBeUploaded>> {
    tools::get_videos_to_upload(dirname)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_version() {
        let version = get_version();
        println!("version => {}", version);
    }

    #[test]
    fn test_get_system_info() {
        get_system_info();
    }

    #[test]
    fn test_get_videos_to_upload() {
        let videos = get_videos_to_upload("/Users/allen/Downloads/videos");
        println!("videos => {:?}", videos);
    }
}
