import { noop } from "@/lib/utils";
import { core, webviewWindow, window, process, event } from "@/lib/tauri";
import { log } from "@/lib";

/**
 * @desc 关闭启动画面
 * @note 全局只执行一次
 */
export function closeSplashscreen() {
  setTimeout(() => {
    core.invoke<void>("close_splashscreen").then(noop).catch(log.error);
  }, 500);
}

/**
 * @desc 屏蔽系统右键菜单
 */
export function disableWindowMenu() {
  const func = (e: MouseEvent) => e.preventDefault();
  document.addEventListener("contextmenu", func);
  return () => {
    document.removeEventListener("contextmenu", func);
  };
}

/**
 * @desc 禁止 Esc 键退出全屏
 */
export function disableEscapeFullscreen() {
  const func = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
    }
  };
  document.addEventListener("keydown", func);
  return () => {
    document.removeEventListener("keydown", func);
  };
}

/**
 * @desc 模拟chrome的全屏切换快捷键 cmd+shift+f or ctrl+shift+f
 */
export function toggleFullscreen() {
  const func = async (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "f") {
      e.preventDefault();
      const current = webviewWindow.getCurrentWebviewWindow();
      const isFullscreen = await current.isFullscreen();
      await current.setFullscreen(!isFullscreen);
    }
  };
  document.addEventListener("keydown", func);
  return () => {
    document.removeEventListener("keydown", func);
  };
}

type WindowConfig = {
  label: string;
  title?: string;
  url?: string;
  titleBarStyle?: window.TitleBarStyle;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  x?: number;
  y?: number;
  focus?: boolean;
  center?: boolean;
  visible?: boolean;
  resizable?: boolean;
  maximized?: boolean;
  fullscreen?: boolean;
  decorations?: boolean;
  alwaysOnTop?: boolean;
  hiddenTitle?: boolean;
  transparent?: boolean;
  skipTaskbar?: boolean;
  hideWhenBlur?: boolean;
  acceptFirstMouse?: boolean;
};

// 系统参数配置
export const windowConfig: WindowConfig = {
  label: "", // 窗口唯一label
  title: "", // 窗口标题
  url: "", // 路由地址url
  titleBarStyle: "overlay", // 窗口标题栏样式
  width: 640, // 窗口宽度
  height: 400, // 窗口高度
  minWidth: undefined, // 窗口最小宽度
  minHeight: undefined, // 窗口最小高度
  x: undefined, // 窗口相对于屏幕左侧坐标
  y: undefined, // 窗口相对于屏幕顶端坐标
  focus: true, // 窗口是否聚焦
  center: true, // 窗口居中显示
  visible: true, // 窗口是否显示
  resizable: true, // 是否支持缩放
  maximized: false, // 最大化窗口
  fullscreen: false, // 窗口是否全屏
  decorations: false, // 窗口是否显示边框
  hiddenTitle: true, // 隐藏标题栏
  transparent: true, // 窗口是否透明
  skipTaskbar: false, // 窗口是否显示在任务栏
  hideWhenBlur: false, // 窗口是否隐藏当失去焦点时
  acceptFirstMouse: true, // 窗口是否接受第一个鼠标事件
};

// 打开视频播放窗口
export async function openWindow(options: WindowConfig) {
  const args = { ...windowConfig, ...options };
  const { label, hideWhenBlur, ...rest } = args;
  if (!label) {
    log.error("openWindow: missing label");
    return;
  }

  // 判断窗口是否存在
  const existWin = await webviewWindow.WebviewWindow.getByLabel(label);
  if (existWin) {
    // await existWin.unminimize();
    await existWin.show();
    await existWin.setFocus();
    // await existWin.setFullscreen(args.fullscreen ?? false);
    return;
  }

  // 创建新的 WebviewWindow，指定唯一的窗口标识符
  let win = new webviewWindow.WebviewWindow(label, rest);

  // 监听窗口是否创建完毕
  win.once("tauri://created", () => {
    log.debug(`openWindow: ${label} window created`);
  });

  // 监听窗口是否出错
  win.once("tauri://error", (e) => {
    log.error(`openWindow: ${label} window create failed`, e);
  });

  // 监听窗口关闭事件
  win.once("tauri://close-requested", () => {
    log.debug(`openWindow: ${label} window closed`);
    // thread 'tokio-runtime-worker' panicked at /Users/allen/.cargo/registry/src/github.com-1ecc6299db9ec823/wry-0.47.0/src/wkwebview/class/wry_web_view.rs:152:10:
    // tried to access uninitialized instance variable
    // win.close();
  });

  if (hideWhenBlur) {
    win.listen("tauri://blur", async (e) => {
      log.debug("openWindow: window blur", e);
      await win.hide();
    });
  }

  return win;
}

// 假设这是点击图片触发新窗口
// document.getElementById('open-video-btn').addEventListener('click', openVideoWindow);

export class Windows {
  mainWin: webviewWindow.WebviewWindow;
  handles: event.UnlistenFn[];

  constructor() {
    this.handles = [];
    this.mainWin = this.getCurrentWin();
  }

  destroy() {
    this.handles.forEach((handle) => handle());
  }

  // 获取当前窗口
  getCurrentWin() {
    return webviewWindow.getCurrentWebviewWindow();
  }

  // 获取全部窗口
  async getAllWin() {
    // return webviewWindow.getAllWebviewWindows()
    return await webviewWindow.WebviewWindow.getAll();
  }

  // 获取窗口
  async getWin(label: string) {
    return await webviewWindow.WebviewWindow.getByLabel(label);
  }

  // 创建新窗口
  async createWin(options: WindowConfig) {
    const args = { ...windowConfig, ...options };
    if (!args.label) {
      log.error("createWin: missing label");
      return;
    }

    // 判断窗口是否存在
    // const existWin = (await this.getAllWin()).find((w) => w.label == args.label);
    const existWin = await this.getWin(args.label);
    if (existWin) {
      await existWin.unminimize();
      await existWin.setFocus();
      return;
      // await existWin.close();
    }

    // 创建窗口对象
    let win = new webviewWindow.WebviewWindow(args.label, args);

    // 是否最大化
    // if (args.maximized && args.resizable) {
    //   win.maximize();
    // }

    // 监听窗口是否创建完毕
    win.once("tauri://created", () => {
      log.debug(`${args.label} window created`);
    });

    // 监听窗口是否出错
    win.once("tauri://error", (e) => {
      log.error(`${args.label} window create failed`, e);
    });

    // 监听窗口关闭事件
    win.once("tauri://close-requested", () => {
      log.debug(`${args.label} window closed`);
    });

    // 监听窗口大小变化
    // this.handles.push(
    //   await win.listen("tauri://resize", async (e) => {
    //     log.debug("window resize", e);
    //   }),
    // );

    return win;
  }

  // 开启主进程监听事件
  async listen() {
    // 创建新窗体
    this.handles.push(
      await event.listen<string>("win-create", (e) => {
        log.debug(e);
        this.createWin(JSON.parse(e.payload));
      }),
    );

    // 显示窗体
    this.handles.push(
      await event.listen("win-show", async (_e) => {
        const appWindow = this.getCurrentWin();
        if (appWindow.label !== "main") return;
        await appWindow.show();
        await appWindow.unminimize();
        await appWindow.setFocus();
      }),
    );

    // 隐藏窗体
    this.handles.push(
      await event.listen("win-hide", async (_e) => {
        const appWindow = this.getCurrentWin();
        if (appWindow.label !== "main") return;
        await appWindow.hide();
      }),
    );

    // 退出应用
    this.handles.push(
      await event.listen("win-exit", async (_e) => {
        // setWin("logout");
        await process.exit();
      }),
    );

    // 重启应用
    this.handles.push(
      await event.listen("win-relaunch", async (_e) => {
        await process.relaunch();
      }),
    );

    // 主/渲染进程传参
    // this.handles.push(
    //   await event.listen<string>("win-set-data", async (e) => {
    //     await event.emit("win-post-data", JSON.parse(e.payload));
    //   }),
    // );
  }
}
