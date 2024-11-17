use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager, Runtime,
};

pub fn create_tray<R: Runtime>(app: &tauri::AppHandle<R>) -> tauri::Result<()> {
    let setting_i = MenuItem::with_id(app, "setting", "设置", true, Some("CmdOrCtrl+,"))?;
    let update_i = MenuItem::with_id(app, "update", "更新", true, Some("CmdOrCtrl+U"))?;
    let quit_i = MenuItem::with_id(app, "quit", "退出", true, Some("CmdOrCtrl+Q"))?;
    let menu = Menu::with_items(app, &[&setting_i, &update_i, &quit_i])?;
    let _ = TrayIconBuilder::with_id("tray")
        .tooltip("downloader")
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .menu_on_left_click(true)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "setting" => {
                tracing::debug!("setting menu item was clicked");
                // app.exit(0);
                app.emit("goto", "/setting/config".to_string())
                    .expect("Failed to emit goto event");
                let win = app.get_window("main").expect("main window not found");
                win.show().expect("Failed to show window");
                win.set_focus().expect("Failed to focus window");
            }
            "update" => {
                tracing::debug!("update menu item was clicked");
                app.emit("update", "update".to_string())
                    .expect("Failed to emit update event");
            }
            "quit" => {
                tracing::debug!("quit menu item was clicked");
                app.exit(0);
            }
            _ => {
                tracing::debug!("menu item {:?} not handled", event.id);
            }
        })
        .on_tray_icon_event(|tray, event| match event {
            TrayIconEvent::Click {
                id: _,
                position,
                rect: _,
                button,
                button_state: _,
            } => match button {
                MouseButton::Left {} => {
                    tracing::debug!("Tray icon left clicked at position: {:?}", position);

                    #[cfg(target_os = "macos")]
                    tray.app_handle().show().expect("Failed to show window");

                    let window = tray
                        .app_handle()
                        .get_window("main")
                        .expect("main window not found");

                    #[cfg(not(target_os = "macos"))]
                    window.show().expect("Failed to show main window");

                    window.set_focus().expect("Failed to focus window");
                }
                MouseButton::Right {} => {
                    tracing::debug!("Tray icon right clicked at position: {:?}", position);
                    tray.app_handle()
                        .emit("tray_contextmenu", position)
                        .expect("Failed to emit tray_contextmenu event");
                }
                _ => {}
            },
            TrayIconEvent::Enter {
                id: _,
                position,
                rect: _,
            } => {
                tracing::debug!("Tray icon enter at position: {:?}", position);
                tray.app_handle()
                    .emit("tray_enter", position)
                    .expect("Failed to emit tray_enter event");
            }
            TrayIconEvent::Leave {
                id: _,
                position,
                rect: _,
            } => {
                tracing::debug!("Tray icon leave at position: {:?}", position);
                tray.app_handle()
                    .emit("tray_leave", position)
                    .expect("Failed to emit tray_leave event");
            }
            _ => {}
        })
        .build(app);
    Ok(())
}
