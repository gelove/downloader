import { useCallback, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Command } from "@/components/common/icons";
import { process as tauriProcess } from "@/lib/tauri";
import { log } from "@/lib";
import { getVersion } from "@/lib/utils";

export default function TrayMenu() {
  useEffect(() => {
    log.debug("TrayMenu mounted");
    const root = window.document.documentElement;
    root.classList.add("bg-transparent");

    // 监听托盘右键事件
    // let unListen = event.listen("tray_contextmenu", async (event) => {
    //   log.debug("tray_contextmenu", event);

    //   const win = await webviewWindow.WebviewWindow.getByLabel("tray_menu");
    //   if (!win) return;

    //   let position = event.payload as { x: number; y: number };
    //   await win.setAlwaysOnTop(true);
    //   await win.setFocus();
    //   await win.setPosition(new tauriWindow.LogicalPosition(position.x, position.y));
    //   await win.show();
    // });

    return () => {
      // unListen.then((fn) => fn());
    };
  }, []);

  const handelExit = useCallback(() => {
    log.debug("TrayMenu exit");
    tauriProcess.exit();
  }, []);

  return (
    <Card className="h-32 w-48 border-none bg-transparent shadow-none">
      <CardContent className="p-1">
        <div className="h-6 px-2 text-sm opacity-50">Downloader {getVersion()}</div>
        <div className="px-2 py-1">
          <Separator />
        </div>
        <Button
          variant="ghost"
          className="h-6 w-full justify-between px-2 py-0 text-left text-xs hover:bg-blue-500 hover:text-white">
          设置
          {/* <Settings2 className="h-4 w-4" /> */}
          <span className="flex items-center justify-center text-xs opacity-50">
            <Command size={12} />
            <span className="ml-1 inline-block w-2">,</span>
          </span>
        </Button>
        <Button
          variant="ghost"
          className="h-6 w-full justify-between px-2 py-0 text-left text-xs hover:bg-blue-500 hover:text-white">
          检测更新
          <span className="flex items-center justify-center text-xs opacity-50">
            <Command size={12} />
            <span className="ml-1 inline-block w-2">U</span>
          </span>
        </Button>
        <div className="px-2 py-1">
          <Separator />
        </div>
        <Button
          variant="ghost"
          onClick={handelExit}
          className="h-6 w-full justify-between px-2 py-0 text-left text-xs hover:bg-blue-500 hover:text-white">
          退出
          <span className="flex items-center justify-center text-xs opacity-50">
            <Command size={12} />
            <span className="ml-1 inline-block w-2">Q</span>
          </span>
        </Button>
      </CardContent>
    </Card>
  );
}
