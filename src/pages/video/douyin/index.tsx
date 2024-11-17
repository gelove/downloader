import { useCallback, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAtom, useAtomValue } from "jotai";
import { useImmer } from "use-immer";
import { useVirtualizer } from "@tanstack/react-virtual";

import { Button } from "@/components/ui/button";
// import { DatePicker } from "@/components/common/date-picker";
import { ComboboxForm } from "@/components/common/combobox";
import { Video, videoQueryAtom } from "@/atoms/douyin/video";
import { Heart, Download, Play, Spinner } from "@/components/common/icons";
import { dialog, event, fs, path, command, core } from "@/lib/tauri";
import { cn } from "@/lib/utils";
import { log, time } from "@/lib";
import { toast } from "@/components/ui";
import { useConfig } from "@/hooks/use-config";
import { DownloadStatus } from "@/config/constant";
import { userAtom } from "@/atoms/douyin/user";
import { Player } from "@/components/common/player";
import { douyin } from "@/service";
// import { openWindow } from "@/lib/windows";

type VideoLoading = {
  id: string;
  total: number;
  current: number;
};

type VideoState = {
  id: string;
  status: DownloadStatus;
  progress: number;
  filepath?: string;
};
type VideoStates = Record<string, VideoState>;

const rowHeight = 320;
const perRowItems = 6;

export default function Douyin() {
  // const [date, setDate] = useState<Date>();
  const [userName, setUserName] = useState("");
  const [downloadAll, setDownloadAll] = useState(false);
  const [hoveredVideoId, setHoveredVideoId] = useState<string>();
  const [selectedVideo, setSelectedVideo] = useImmer<VideoState | undefined>(undefined);
  const [videoStates, setVideoStates] = useImmer<VideoStates>({});
  const { config, setConfig } = useConfig();
  const user = useAtomValue(userAtom);

  const allRows = useRef<Video[]>([]);
  const hasNextPageRef = useRef(true);
  const handleNextPageRef = useRef<Function>();

  if (!config?.douyin?.cookie) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <Button asChild>
          <Link to="/setting/config" state={{ label: "设置" }}>
            <span>请先设置抖音 Cookie</span>
          </Link>
        </Button>
      </div>
    );
  }

  useEffect(() => {
    // 使用正则过滤掉非字母、数字、下划线以及中文字符的文本
    setUserName(user.nickname.replace(/[^\w\u4e00-\u9fa5]+/g, ""));
  }, [user]);

  useEffect(() => {
    // StrictMode 开发模式下会导致监听事件被调用两次, 构建后不会
    const unListen = event.listen<VideoLoading>("e_download_progress", (event) => {
      // log.debug("e_download_progress =>", event.payload);
      const { id, current = 0, total = 1 } = event.payload || {};
      if (!id) {
        log.error(`listen e_download_progress: id => ${id}`);
        return;
      }
      setVideoStates((draft) => {
        if (!draft[id]) return;
        draft[id].progress = Math.floor((current / total) * 100);
      });
    });
    return () => {
      unListen.then((fn) => fn());
    };
  }, []);

  const openVideo = useCallback(
    async (e: React.MouseEvent<HTMLElement>) => {
      const { id } = e.currentTarget.dataset;
      if (!id) return;
      const video = videoStates[id];
      if (!video?.filepath) return;
      const exists = await fs.exists(video.filepath);
      if (!exists) {
        // log.error("VideoPlayer: file not exists =>", video.filepath);
        setVideoStates((draft) => {
          draft[video.id].status = DownloadStatus.Initial;
          draft[video.id].progress = 0;
          draft[video.id].filepath = "";
        });
        setTimeout(close, 0);
        return;
      }
      await command.openWith(video.filepath);
      // setSelectedVideo(video);
      // await openWindow({
      //   label: "video-player",
      //   url: `http://localhost:1420/player?file=${video.filepath}`,
      //   width: 800,
      //   height: 600,
      //   focus: true,
      //   resizable: true,
      //   maximized: true,
      //   hiddenTitle: true,
      //   transparent: true,
      //   acceptFirstMouse: true,
      //   fullscreen: true,
      // });
    },
    [videoStates],
  );

  const closeVideo = useCallback(() => {
    setSelectedVideo(undefined);
  }, []);

  const getDownloadDir = useCallback(async () => {
    if (!config) {
      toast.error("配置信息获取失败");
      return;
    }
    let downloadDir = config.app.download_dir;
    log.debug("handleDownloadOne: downloadDir =>", downloadDir);
    if (downloadDir) {
      return downloadDir;
    }
    const dir = await dialog.open({
      title: "选择下载目录",
      directory: true,
      defaultPath: config.app.download_dir || (await path.downloadDir()),
    });
    if (!dir) {
      toast.error("下载目录选择失败");
      return;
    }
    setConfig({ ...config, app: { ...config.app, download_dir: dir } });
    return dir;
  }, [config]);

  const handleDownload = useCallback(
    async (id: string, url: string, title: string, downloadDir: string, userName: string) => {
      try {
        // 使用正则过滤掉非字母、数字、下划线以及中文字符的文本
        // const userName = nickname.replace(/[^\w\u4e00-\u9fa5]+/g, "");
        const fileName = `${id}.mp4`;
        const savePath = `${downloadDir}/${userName}`;
        // 创建单个视频目录
        // await createDir(savePath);
        setVideoStates((draft) => {
          draft[id] = { id, progress: 0, status: DownloadStatus.Loading };
        });
        const filepath = await douyin.download(id, url, title, fileName, savePath);
        log.debug("handleDownloadOne: filepath =>", filepath);
        setVideoStates((draft) => {
          draft[id].status = DownloadStatus.Done;
          draft[id].filepath = filepath;
        });
      } catch (err) {
        setVideoStates((draft) => {
          draft[id] = { id, progress: 0, status: DownloadStatus.Initial };
        });
        log.error("handleDownloadOne:", err);
        toast.error("下载失败");
      }
    },
    [],
  );

  const handleDownloadOne = useCallback(
    async (e: React.MouseEvent<HTMLElement>) => {
      // const { name } = user;
      if (!user.uid || !user.nickname) {
        toast.error("用户信息获取失败");
        return;
      }
      const { id = "", url = "", title = "" } = e.currentTarget.dataset;
      if (!id || !url) {
        log.error("handleDownloadOne: missing data", e.currentTarget.dataset);
        toast.error("下载视频缺少必要参数");
        return;
      }
      const downloadDir = await getDownloadDir();
      if (!downloadDir) {
        toast.error("下载目录选择失败");
        return;
      }
      // 使用正则过滤掉非字母、数字、下划线以及中文字符的文本
      await handleDownload(id, url, title, downloadDir, userName);
    },
    [userName, getDownloadDir, handleDownload],
  );

  const parentRef = useRef<HTMLDivElement>(null);

  const [{ status, data, error, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage }] =
    useAtom(videoQueryAtom);

  hasNextPageRef.current = hasNextPage;
  handleNextPageRef.current = fetchNextPage;

  allRows.current = data ? data.pages.flatMap((v) => v?.list || []) : [];

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(allRows.current.length / perRowItems), // 行数, 每行有`perRowItems`个视频
    getScrollElement: () => parentRef.current, // 获取滚动元素
    estimateSize: () => rowHeight, // 预估每行的高度（可以调整）
    overscan: 5, // 缓冲区
  });

  const handleScroll = useCallback(() => {
    if (parentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
      if (scrollHeight - scrollTop === clientHeight && hasNextPage) {
        // 滚动到底部时获取更多视频
        fetchNextPage();
      }
    }
  }, [hasNextPage, fetchNextPage]);

  const hoverVideoHandle = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const { id } = e.currentTarget.dataset;
    if (!id) return;
    setHoveredVideoId(id);
  }, []);

  const leaveVideoHandle = useCallback(() => {
    setHoveredVideoId(undefined);
  }, []);

  const handleDownloadPatch = useCallback(async () => {
    // const allRows = data ? data.pages.flatMap((v) => v?.list || []) : [];
    log.debug("handleDownloadPatch: allRows =>", allRows.current.length);
    if (!allRows.current.length) {
      toast.info("没有可下载的视频");
      return;
    }

    const downloadDir = await getDownloadDir();
    if (!downloadDir) {
      toast.error("下载目录选择失败");
      return;
    }

    try {
      const list = allRows.current.filter((video) => !videoStates[video.id]?.filepath);
      // log.debug("handleDownloadPatch: list =>", list);
      for (const video of list) {
        const { id, url, title } = video;
        if (!id || !url) {
          log.error("handleDownloadPatch: 下载视频缺少必要数据", video);
          continue;
        }
        await handleDownload(id, url, title, downloadDir, userName);
      }
      toast.success("全部下载完成");
    } catch (err) {
      log.error("handleDownloadPatch:", err);
      toast.error("全部下载未完成");
    }
  }, [userName, allRows, videoStates, getDownloadDir, handleDownload]);

  const handleDownloadAll = useCallback(async () => {
    try {
      setDownloadAll(true);
      while (hasNextPageRef.current && handleNextPageRef.current) {
        log.debug("startDownloadAll: hasNextPageRef.current =>", hasNextPageRef.current);
        await handleNextPageRef.current();
        // 睡眠 1s 防止频繁请求
        // await new Promise((resolve) => setTimeout(resolve, 1000));
        await time.sleep();
      }
      await handleDownloadPatch();
    } catch (err) {
      log.error("handleDownloadAll:", err);
    } finally {
      setDownloadAll(false);
    }
  }, [handleDownloadPatch]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <div className="w-1/2">
          <ComboboxForm
            emptyMessage="无匹配选项, 输入用户主页链接并按回车键添加新用户"
            placeholder="输入用户名或主页链接，例如: www.douyin.com/user/......"
          />
        </div>
        {/* <DatePicker mode="single" selected={date} onSelect={setDate} /> */}
        <Button onClick={handleDownloadAll} disabled={downloadAll} className="w-40">
          {downloadAll && <Spinner className="animate-spin" size={16} />}
          全部下载
        </Button>
      </div>
      <div
        ref={parentRef}
        style={{ height: "calc(100vh - 136px)" }}
        className="mx-auto mt-2 w-full overflow-y-auto"
        onScroll={handleScroll}>
        <div className={cn(`relative w-full`)} style={{ height: rowVirtualizer.getTotalSize() }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const startIndex = virtualRow.index * perRowItems;
            const endIndex = Math.min(startIndex + perRowItems, allRows.current.length);
            const rowVideos = allRows.current.slice(startIndex, endIndex);
            return (
              <div
                key={virtualRow.index}
                style={{
                  top: virtualRow.start,
                  height: virtualRow.size - 8,
                  gridTemplateColumns: `repeat(${perRowItems}, 1fr)`,
                }}
                className="absolute left-0 my-1 grid w-full gap-2">
                {rowVideos.map((video) => (
                  <div
                    key={video.id}
                    data-id={video.id}
                    style={{ height: virtualRow.size - 8 }}
                    className="rounded-md border-[1px] border-solid border-gray-300 p-2 text-center"
                    onMouseEnter={hoverVideoHandle}
                    onMouseLeave={leaveVideoHandle}>
                    <div className="relative h-60">
                      {video.cover && (
                        <img
                          src={video.cover}
                          alt={video.title || video.desc}
                          className="h-full w-full object-cover"
                        />
                      )}
                      {video.likes && (
                        <div className="absolute bottom-2 left-2 flex items-center text-white">
                          <Heart className="mr-1 h-4 w-4" />
                          <span className="text-sm">{video.likes}</span>
                        </div>
                      )}
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 rounded bg-black bg-opacity-60 px-1 py-0.5 text-xs text-white">
                          {time.formatDuration(video.duration)}
                        </div>
                      )}
                      {videoStates[video.id]?.status === DownloadStatus.Loading && (
                        <div className="absolute inset-0 flex items-center justify-center space-x-4 bg-black bg-opacity-50">
                          <div className="rounded-full bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/90">
                            <span>{videoStates[video.id]?.progress}%</span>
                          </div>
                        </div>
                      )}
                      {hoveredVideoId === video.id && (
                        <div className="absolute inset-0 flex items-center justify-center space-x-4 bg-black bg-opacity-50">
                          {!videoStates[video.id]?.status && (
                            <button
                              data-id={video.id}
                              data-url={video.url}
                              data-title={video.desc}
                              onClick={handleDownloadOne}
                              className="rounded-full bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/90">
                              <Download size={24} />
                            </button>
                          )}
                          {videoStates[video.id]?.status === DownloadStatus.Done && (
                            <button
                              data-id={video.id}
                              onClick={openVideo}
                              className="rounded-full bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/90">
                              <Play size={24} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="p-1">
                      <p className="mb-1 line-clamp-2 text-sm">{video.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center">
          {!isFetching && !hasNextPage && <div>没有更多视频了</div>}
          {(isFetching || isFetchingNextPage) && <div>加载中...</div>}
          {status === "error" && (
            <div>
              <span>加载失败: {error.message}</span>
            </div>
          )}
        </div>
      </div>
      {selectedVideo?.filepath && (
        <Player filepath={core.convertFileSrc(selectedVideo.filepath)} close={closeVideo} />
      )}
    </div>
  );
}
