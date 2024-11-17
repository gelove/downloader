use std::env;
use std::path::PathBuf;

use chrono::Local;
// use tauri::{ipc::Channel, AppHandle};
use tauri::{Listener, Manager};
use tauri_plugin_updater::UpdaterExt;
use tracing::level_filters::LevelFilter;
use tracing_appender::{non_blocking, rolling};
use tracing_error::ErrorLayer;
use tracing_subscriber::prelude::*;
use tracing_subscriber::{
    fmt::{self, format::Writer, time::FormatTime},
    layer::SubscriberExt,
    util::SubscriberInitExt,
    EnvFilter,
};

pub mod command;
pub mod common;
pub mod config;
pub mod core;
pub mod tray;

use config::LogLevel;

// 用来格式化日志的输出时间格式
struct LocalTimer;

impl FormatTime for LocalTimer {
    fn format_time(&self, w: &mut Writer<'_>) -> std::fmt::Result {
        write!(w, "{}", Local::now().format("%FT%T%.3fTZ"))
    }
}

macro_rules! destructure_vec {
    ($vec:expr, $( $name:ident ),+ ) => {
        let mut iter = $vec.into_iter();
        $( let $name = iter.next().expect("Not enough elements in vector!"); )+
    };
}

macro_rules! create_log_handler {
    ($level:ident) => {
        |event| {
            let payload = event.payload();
            let message = format_log(payload);
            match message.len() {
                0 => tracing::$level!(message = payload, "[Client]"),
                1 => tracing::$level!(message = ?message[0], "[Client]"),
                2 => {
                    destructure_vec!(message, first, second);
                    tracing::$level!(?first, ?second, "[Client]")
                },
                _ => {
                    destructure_vec!(message, first, second, third);
                    tracing::$level!(?first, ?second, ?third, "[Client]")
                },
            }
        }
    };
}

fn format_log(content: &str) -> Vec<serde_json::Value> {
    let data = serde_json::from_str::<serde_json::Value>(content).unwrap_or_default();
    if data.is_array() {
        let mut result = vec![];
        if let Some(list) = data.as_array() {
            for item in list {
                if let Some(_) = item.as_bool() {
                    result.push(item.clone());
                }
                if let Some(_) = item.as_str() {
                    result.push(item.clone());
                }
                if let Some(_) = item.as_f64() {
                    result.push(item.clone());
                }
                if let Some(_) = item.as_array() {
                    result.push(item.clone());
                }
                if let Some(_) = item.as_object() {
                    result.push(item.clone());
                }
            }
        }
        return result;
    }
    return vec![data];
}

#[allow(dead_code)]
async fn update(handle: tauri::AppHandle) -> anyhow::Result<()> {
    let mut builder = handle.updater_builder();
    if std::env::var("TARGET").unwrap_or_default() == "nsis" {
        // /D sets the default installation directory ($INSTDIR),
        // overriding InstallDir and InstallDirRegKey.
        // It must be the last parameter used in the command line and must not contain any quotes, even if the path contains spaces.
        // Only absolute paths are supported.
        // NOTE: we only need this because this is an integration test and we don't want to install the app in the programs folder
        builder = builder.installer_args(vec![format!(
            "/D={}",
            tauri::utils::platform::current_exe()?
                .parent()
                .unwrap()
                .display()
        )]);
    }
    let updater = builder
        // .version_comparator(|current, update| {
        //     // 允许版本降级
        //     // default comparison: `update.version > current`
        //     update.version != current
        // })
        .build()?;

    let mut downloaded = 0;

    match updater.check().await {
        Ok(Some(update)) => {
            if let Err(e) = update
                .download_and_install(
                    |chunk_length, content_length| {
                        downloaded += chunk_length;
                        println!("downloaded {downloaded} from {content_length:?}");
                    },
                    || {
                        println!("download finished");
                    },
                )
                .await
            {
                println!("{e}");
                std::process::exit(1);
            }
            std::process::exit(0);
        }
        Ok(None) => {
            std::process::exit(2);
        }
        Err(e) => {
            println!("{e}");
            std::process::exit(1);
        }
    }
}

pub fn run() {
    let _ = fix_path_env::fix();

    // let current_exe = std::env::current_exe().unwrap();
    // println!("Current exe: {}", current_exe.display());
    // let current_dir = std::env::current_dir().unwrap();
    // println!("Current directory: {}", current_dir.display());

    let mut app = tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        // .plugin(
        //     tauri_plugin_log::Builder::new()
        //         .clear_targets()
        //         .targets([
        //             Target::new(TargetKind::Webview),
        //             Target::new(TargetKind::LogDir {
        //                 file_name: Some("webview".into()),
        //             })
        //             .filter(|metadata| metadata.target() == WEBVIEW_TARGET),
        //             Target::new(TargetKind::LogDir {
        //                 file_name: Some("rust".into()),
        //             })
        //             .filter(|metadata| metadata.target() != WEBVIEW_TARGET),
        //         ])
        //         .build(),
        // )
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        // .menu(menu)
        .setup(|app| {
            // let handle = app.handle().clone();
            // tauri::async_runtime::spawn(async move {
            //     update(handle).await;
            // });

            let resolver = app.path();
            let config_dir = resolver
                .app_config_dir()
                .expect("failed to get app config dir");
            if !config_dir.exists() {
                println!("Creating config directory: {:?}", config_dir);
                std::fs::create_dir_all(config_dir.as_path())
                    .expect("failed to create app config dir");
            }

            let config_path = config_dir.join("config.toml");
            // 创建 config.toml 文件 如果文件不存在
            if !config_path.exists() {
                std::fs::write(config_path.clone(), include_str!("../../config.toml"))?;
            }
            let content = std::fs::read_to_string(&config_path)?;
            // TODO: 更新时可能需要添加配置字段, 需要修改用户配置
            // let mut content = std::fs::read_to_string(&config_path)?;
            // let is_update = false;
            // if is_update {
            //     let mut config = toml::from_str::<serde_json::Value>(&content)?;
            //     config["app"]["download_dir"] = "".into();
            //     content = toml::to_string(&config)?;
            //     std::fs::write(config_path, &content)?;
            // }
            // 设置 config
            config::update(&content, None)?;

            // 追加 $PATH 环境变量
            let path = std::env::var_os("PATH").unwrap_or_default();
            // println!("path: {}", path);
            let mut paths: Vec<PathBuf> = std::env::split_paths(&path).collect::<Vec<_>>();

            let bin = config_dir.join("bin");
            // 追加路径到 $PATH 环境变量的最前面
            paths.insert(0, bin);

            // let resource_dir = resolver.resource_dir().expect("failed to get resource dir");
            // println!("resource_dir: {:?}", resource_dir);
            // #[cfg(target_os = "macos")]
            // {
            //     let ffmpeg_bin = resource_dir.join("bin/macos");
            //     paths.insert(0, ffmpeg_bin);
            // }
            // #[cfg(target_os = "windows")]
            // {
            //     let ffmpeg_bin = resource_dir.join("bin/windows/ffmpeg");
            //     paths.insert(0, ffmpeg_bin);
            // }

            // 将 `Vec` 转换为系统字符串
            let new_path = std::env::join_paths(paths)?;
            println!("new_path: {}", new_path.to_str().unwrap());
            // 使用 `std::env::set_var()` 函数设置新的 $PATH 环境变量值
            unsafe { std::env::set_var("PATH", &new_path) };

            #[cfg(all(desktop))]
            {
                let handle = app.handle();
                tray::create_tray(handle)?;
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            command::close_splashscreen,
            command::get_version,
            command::get_system_info,
            command::get_config,
            command::set_config,
            command::get_output_filepath,
            command::get_videos_to_upload,
            command::get_user,
            command::get_user_by_ies,
            command::get_videos_by_uid,
            command::download,
            // download_bin,
        ])
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::Focused(_focused) => {
                // hide window whenever it loses focus
                // if !focused {
                //     window.hide().expect("Failed to hide window");
                // }
            }
            tauri::WindowEvent::CloseRequested { api, .. } => {
                tracing::debug!("Window close requested");
                if window.label() == "main" {
                    // 取消关闭操作，并隐藏窗口
                    api.prevent_close();

                    #[cfg(target_os = "macos")]
                    window.app_handle().hide().expect("Failed to hide app");

                    #[cfg(not(target_os = "macos"))]
                    window
                        .hide()
                        .expect("Failed to hide window in close_requested event");
                }
            }
            _ => {}
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    #[cfg(target_os = "macos")]
    app.set_activation_policy(tauri::ActivationPolicy::Regular);

    let resolver = app.path();
    // ~/Library/Logs/top.allens.downloader
    // C:\Users\***\AppData\Local\top.allens.downloader\logs
    let app_log_dir = resolver.app_log_dir().unwrap_or_default();

    // 格式化输出到终端
    let console_subscriber = fmt::layer()
        .with_writer(std::io::stdout)
        .with_timer(LocalTimer)
        .with_filter(LevelFilter::DEBUG)
        .boxed();

    // NOTE: tracing_appender::non_blocking 相关不能独立抽取为方法 _guard 会 dropped 导致写入日志文件失败
    // https://users.rust-lang.org/t/when-i-learning-rust-i-have-a-problem-in-use-tracing-to-log/114112
    // 格式化输出到日志文件  `/path/to/logs/log.yyyy-MM-dd-HH`

    // NOTE: 打包时日志目录如果使用相对路径 `./logs`, 会启动失败
    // 开发环境下日志目录为 `./logs`
    // 打包环境下日志目录为 `~/Library/Application Support/${bundle_identifier}/logs`
    let log_dir = if cfg!(debug_assertions) {
        PathBuf::from("logs")
    } else {
        app_log_dir
    };
    if !log_dir.exists() {
        std::fs::create_dir_all(log_dir.as_path()).expect("failed to create log dir");
    }
    let file_appender = rolling::daily(&log_dir, "log");
    // NOTE: _guard 用于在程序退出时关闭文件句柄
    let (non_blocking_appender, _guard) = non_blocking(file_appender);
    let file_subscriber = fmt::layer()
        .with_ansi(false)
        .with_writer(non_blocking_appender)
        .with_timer(LocalTimer)
        .with_filter(LevelFilter::INFO)
        .boxed();

    // max_level: 最大日志级别, 小于等于该级别的日志将被记录
    // Level::TRACE 最大, Level::ERROR 次小, Level::OFF 最小(即关闭日志)
    // let filter = EnvFilter::from_default_env().add_directive(tracing::Level::INFO.into());
    let filter = EnvFilter::builder()
        .with_default_directive(LevelFilter::DEBUG.into())
        .from_env_lossy();

    tracing_subscriber::registry()
        .with(ErrorLayer::default())
        .with(console_subscriber)
        .with(file_subscriber)
        .with(filter)
        .init();

    let path = std::env::var_os("PATH").unwrap_or_default();
    tracing::info!("path: {}", path.to_str().unwrap());

    let test_handler = app.listen_any("test", move |event| {
        let message = format_log(event.payload());
        tracing::debug!(?log_dir, ?message, "test_handler:");
    });

    let debug_handler = app.listen_any(LogLevel::Debug, create_log_handler!(debug));
    let info_handler = app.listen_any(LogLevel::Info, create_log_handler!(info));
    let warn_handler = app.listen_any(LogLevel::Warn, create_log_handler!(warn));
    let error_handler = app.listen_any(LogLevel::Error, create_log_handler!(error));

    app.run(move |handle, event| {
        // #[cfg(all(desktop, not(test)))]
        match event {
            // tauri::RunEvent::ExitRequested { api, .. } => {
            //     tracing::info!("Exit requested");
            //     // 阻止应用程序退出
            //     // 即使所有窗口都关闭, 事件循环仍保持运行
            //     // 这允许我们在没有窗口时捕获托盘图标事件
            //     api.prevent_exit();
            // }
            tauri::RunEvent::ExitRequested { .. } => {
                tracing::info!("Exit requested");
            }
            tauri::RunEvent::Exit => {
                // 程序退出时取消监听
                handle.unlisten(test_handler);
                handle.unlisten(debug_handler);
                handle.unlisten(info_handler);
                handle.unlisten(warn_handler);
                handle.unlisten(error_handler);
                tracing::info!("Exit event loop");
                // 在退出之前会自动调用
                // handle.cleanup_before_exit();
            }
            _ => {}
        }
    });
}
