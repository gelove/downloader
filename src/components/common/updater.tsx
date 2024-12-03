import { useState, useEffect, useRef, useCallback } from "react";
import { check, Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

import { Ban, CheckCircle, Download, RefreshCw } from "@/components/common/icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { log } from "@/lib";
import { sleep } from "@/lib/time";
import { noop } from "@/lib/utils";

export enum UpdateStatus {
  Checking,
  UpToDate,
  Available,
  Downloading,
  Installing,
  Ready,
  Error,
}

// 根据状态定义显示的内容
const statusConfig = {
  [UpdateStatus.Checking]: {
    title: "正在检查更新",
    description: "正在检查是否有可用的更新...",
    icon: <RefreshCw className="h-4 w-4 animate-spin" />,
    color: "bg-blue-50 dark:bg-blue-900",
  },
  [UpdateStatus.UpToDate]: {
    title: "当前程序已是最新版本",
    description: "您的程序已经是最新版本，无需更新。",
    icon: <CheckCircle className="h-4 w-4" />,
    color: "bg-green-50 dark:bg-green-900",
  },
  [UpdateStatus.Available]: {
    title: "发现新版本",
    description: "发现新版本，准备下载...",
    icon: <Download className="h-4 w-4" />,
    color: "bg-yellow-50 dark:bg-yellow-900",
  },
  [UpdateStatus.Downloading]: {
    title: "正在下载更新",
    description: "正在下载新版本，请稍候...",
    icon: <Download className="h-4 w-4" />,
    color: "bg-blue-50 dark:bg-blue-800",
  },
  [UpdateStatus.Installing]: {
    title: "正在安装更新",
    description: "正在安装新版本，请稍候..",
    icon: <CheckCircle className="h-4 w-4" />,
    color: "bg-blue-200 dark:bg-blue-900",
  },
  [UpdateStatus.Ready]: {
    title: "更新已就绪",
    description: "新版本已下载完成，重启程序即可完成更新。",
    icon: <CheckCircle className="h-4 w-4" />,
    color: "bg-green-50 dark:bg-green-900",
  },
  [UpdateStatus.Error]: {
    title: "更新失败",
    description: "程序更新失败，请稍后再试。",
    icon: <Ban className="h-4 w-4" />,
    color: "bg-red-50 dark:bg-red-900",
  },
};

export type UpdaterProps = {
  show: boolean;
  onClose: () => void;
};

export function Updater({ show = false, onClose }: UpdaterProps) {
  const contentLength = useRef(0);
  const update = useRef<Update | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<UpdateStatus>(UpdateStatus.Checking);
  const { title, description, icon, color } = statusConfig[status];

  useEffect(() => {
    const func = async () => {
      try {
        // await message(`检测更新`, { title: "Tauri", kind: "info" });
        update.current = await check();
        // log.info("update =>", update);
        // {"available":true,"currentVersion":"1.0.3","version":"1.0.4","date":"2024-11-22 5:40:31.153 +00:00:00","body":"👀 See the 📂 assets to ⬇️ download this 🆕 version and 🔧 install."}
        // await message(`检测更新 ${JSON.stringify(update)}`, { title: "Tauri", kind: "info" });
        if (!update.current?.available) {
          setStatus(UpdateStatus.UpToDate);
          return;
        }
        setStatus(UpdateStatus.Available);
      } catch (e) {
        log.error("check update error", e);
        setStatus(UpdateStatus.Error);
      }
    };
    func().then(noop);

    return () => {
      update.current?.close();
    };
  }, []);

  const handleInstall = useCallback(async () => {
    try {
      setStatus(UpdateStatus.Installing);
      await update.current?.install();
      setStatus(UpdateStatus.Ready);
      await sleep(1000);
      await relaunch();
    } catch (e) {
      log.error("install error", e);
      setStatus(UpdateStatus.Error);
    } finally {
    }
  }, []);

  // 安装更新
  const handleUpdate = useCallback(async () => {
    try {
      setStatus(UpdateStatus.Downloading);
      await update.current?.download((e) => {
        // 打开下载进度条
        if (e.event === "Started") {
          log.info("update Started contentLength =>", e.data.contentLength);
          contentLength.current = e.data.contentLength || 0;
          return;
        }
        if (e.event === "Progress") {
          log.info("update progress chunkLength =>", e.data.chunkLength);
          if (contentLength.current) {
            setProgress((e.data.chunkLength / contentLength.current) * 100);
          }
          return;
        }
        if (e.event === "Finished") {
          log.info("update Finished");
          setProgress(100);
        }
      });
      await sleep(1000);
      await handleInstall();
    } catch (e) {
      log.error("download  error", e);
      setStatus(UpdateStatus.Error);
    } finally {
    }
  }, [handleInstall]);

  return (
    <div className="container">
      {show && (
        <Dialog open={true} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>程序更新</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Alert className={`${color} border-none`}>
                <AlertTitle className="flex items-center gap-2">
                  {icon}
                  {title}
                </AlertTitle>
                <AlertDescription>{description}</AlertDescription>
              </Alert>
              {status === UpdateStatus.Downloading && (
                <Progress value={progress} className="w-full" />
              )}
            </div>
            <DialogFooter>
              {[UpdateStatus.Available, UpdateStatus.Downloading, UpdateStatus.Installing].includes(
                status,
              ) && (
                <Button
                  disabled={[UpdateStatus.Downloading, UpdateStatus.Installing].includes(status)}
                  onClick={handleUpdate}>
                  立即更新
                </Button>
              )}
              {[UpdateStatus.UpToDate, UpdateStatus.Ready, UpdateStatus.Error].includes(status) && (
                <Button onClick={onClose}>关闭</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
