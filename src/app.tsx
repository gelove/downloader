import { Suspense, useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// import nprogress from "nprogress";
// import "nprogress/nprogress.css";

import { Toaster } from "@/components/ui";
import { Theme } from "@/config/constant";
import { router } from "@/config/router";
import { useTheme } from "@/hooks/use-theme";
import { useConfig } from "@/hooks/use-config";
import { useTasks } from "@/hooks/use-tasks";
import { disableWindowMenu } from "@/lib/windows";
import { log } from "@/lib";
import { getVersion } from "@/lib/utils";
// import { event, webviewWindow, window as tauriWindow } from "@/lib/tauri";

// 禁止进度条添加loading
// nprogress.configure({ showSpinner: false });

const queryClient = new QueryClient();

function MyFallbackComponent({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      {/* <pre>{error.stack}</pre> */}
      <button onClick={resetErrorBoundary}>点击重试</button>
    </div>
  );
}

export default function App() {
  // const location = useLocation();
  const { theme } = useTheme();
  const { clear } = useTasks();
  // const focusChange = useRef<event.UnlistenFn>();

  // 初始化配置
  useConfig();

  useEffect(() => {
    log.debug("app mounted", getVersion());
    // closeSplashscreen();

    // const fn = async () => {
    //   const win = await openWindow({
    //     label: "tray_menu",
    //     url: "/tray_menu",
    //     visible: false,
    //     width: 192,
    //     height: 128,
    //     skipTaskbar: true,
    //     transparent: true,
    //     decorations: false,
    //   });
    //   if (!win) return;
    //   // const unlisten = await win.onFocusChanged(({ payload: focused }) => {
    //   //   log.debug("Focus changed, window is focused? " + focused);
    //   // });
    //   // focusChange.current = unlisten;
    // };
    // fn();

    // 监听托盘右键事件
    // let unListen = event.listen("tray_contextmenu", async (event) => {
    //   log.debug("tray_contextmenu", event);

    //   // const win = await webviewWindow.WebviewWindow.getByLabel("tray_menu");
    //   const win = await webviewWindow.WebviewWindow.getByLabel("tray_menu");
    //   log.debug("win", win);
    //   if (!win) return;

    //   let position = event.payload as { x: number; y: number };
    //   const factor = await win.scaleFactor();
    //   log.debug("factor", factor);
    //   await win.setAlwaysOnTop(true);
    //   await win.setFocus();
    //   await win.setPosition(
    //     new tauriWindow.LogicalPosition(position.x / factor, position.y / factor),
    //   );
    //   await win.show();
    // });

    return () => {
      log.debug("app unmounted");
      // unListen.then((fn) => fn());
      // focusChange.current && focusChange.current();
    };
  }, []);

  useEffect(() => {
    return clear;
  }, []);

  useEffect(() => {
    return disableWindowMenu();
  }, []);

  // useEffect(() => {
  //   return disableEscapeFullscreen();
  // }, []);

  // useEffect(() => {
  //   return toggleFullscreen();
  // }, []);

  // useEffect(() => {
  //   nprogress.start();
  // }, []);

  // useEffect(() => {
  //   nprogress.done();
  //   return () => {
  //     nprogress.start();
  //   };
  // }, [location]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(Theme.Light, Theme.Dark);
    if (theme === Theme.System) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? Theme.Dark
        : Theme.Light;
      root.classList.add(systemTheme);
      return;
    }
    root.classList.add(theme);
  }, [theme]);

  // 这里根据服务端返回权限来筛选过滤路由
  // const permissions = ["user", "admin"];
  // const list = routes.filter((v) => v.path && permissions.includes(v.path));

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary
          FallbackComponent={MyFallbackComponent}
          onReset={(details) => {
            // Reset the state of your app so the error doesn't happen again
            log.debug("Error boundary reset", details);
          }}>
          <RouterProvider router={router} />
        </ErrorBoundary>
        <Toaster richColors position="top-center" expand={true} />
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </Suspense>
  );
}
