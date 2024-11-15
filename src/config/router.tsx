import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "@/layouts";
import Dashboard from "@/pages/dashboard";
import Download from "@/pages/app/update";
import TrayMenu from "@/pages/app/tray-menu";
import Config from "@/pages/setting/config";
import Media from "@/pages/tools/media";
import Audio from "@/pages/tools/transcode/audio";
import Video from "@/pages/tools/transcode/video";
import Douyin from "@/pages/video/douyin";
import Tiktok from "@/pages/video/tiktok";
import Player from "@/pages/video/player";
import ReactQuery from "@/pages/example/react-query";
import JotaiQuery from "@/pages/example/jotai-query";
import ReactVirtualGrid from "@/pages/example/react-virtual/grid";
import ReactVirtualInfinite from "@/pages/example/react-virtual/infinite";

// const dashboard = lazy(() => import("../pages/dashboard"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "setting",
        children: [
          {
            path: "config",
            element: <Config />,
          },
        ],
      },
      {
        path: "tools",
        children: [
          {
            path: "media",
            element: <Media />,
          },
          {
            path: "video",
            element: <Video />,
          },
          {
            path: "audio",
            element: <Audio />,
          },
        ],
      },
      {
        path: "video",
        children: [
          {
            path: "douyin",
            element: <Douyin />,
          },
          {
            path: "tiktok",
            element: <Tiktok />,
          },
        ],
      },
    ],
  },
  {
    path: "player",
    element: <Player />,
  },
  { path: "tray_menu", element: <TrayMenu /> },
  {
    path: "download",
    element: <Download />,
  },
  {
    path: "example",
    element: <AppLayout />,
    children: [
      {
        path: "react-query",
        element: <ReactQuery />,
      },
      {
        path: "jotai-query",
        element: <JotaiQuery />,
      },
      {
        path: "react-virtual",
        children: [
          {
            path: "grid",
            element: <ReactVirtualGrid />,
          },
          {
            path: "infinite",
            element: <ReactVirtualInfinite />,
          },
        ],
      },
    ],
  },
]);

export { router };
