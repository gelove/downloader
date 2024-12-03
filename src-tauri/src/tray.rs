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
        .menu_on_left_click(false)
        // .show_menu_on_left_click(false) // next version
        .on_menu_event(|app, event| match event.id.as_ref() {
            "setting" => {
                tracing::debug!("setting menu item was clicked");
                // app.exit(0);
                app.emit("goto", "/setting/config".to_string())
                    .expect("Failed to emit goto event");
                if let Some(win) = app.get_window("main") {
                    if let Ok(visible) = win.is_visible() {
                        if !visible {
                            let _ = win.show();
                        }
                    }
                    if let Ok(focused) = win.is_focused() {
                        if !focused {
                            let _ = win.set_focus();
                        }
                    }
                }
            }
            "update" => {
                tracing::debug!("update menu item was clicked");
                app.emit("update", "update".to_string())
                    .expect("Failed to emit update event");
                // if let Some(wind) = app.get_window("updater") {
                //     let _ = wind.show();
                //     let _ = wind.set_focus();
                //     return;
                // }
                // let _ =
                //     WebviewWindowBuilder::new(app, "updater", WebviewUrl::App("updater".into()))
                //         .inner_size(600.0, 240.0)
                //         .resizable(false)
                //         .center()
                //         .build();
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
                    let app = tray.app_handle();

                    #[cfg(target_os = "macos")]
                    app.show().expect("Failed to show window");

                    #[cfg(not(target_os = "macos"))]
                    {
                        if let Some(wind) = app.get_window("main") {
                            let _ = wind.show();
                            let _ = wind.set_focus();
                        }
                    }
                }
                // MouseButton::Right {} => {
                //     tracing::debug!("Tray icon right clicked at position: {:?}", position);
                //     tray.app_handle()
                //         .emit("tray_contextmenu", position)
                //         .expect("Failed to emit tray_contextmenu event");
                // }
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
