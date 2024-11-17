import { useCallback, useEffect, useRef, useState } from "react";
import { useImmer } from "use-immer";
import { useVirtualizer } from "@tanstack/react-virtual";

import { Button } from "@/components/ui/button";
import { FileAudio2, Trash2 } from "@/components/common/icons";
import { log } from "@/lib";
import { command, core } from "@/lib/tauri";

import { AddFiles } from "@/pages/tools/transcode/add-files";
import { AudioParams } from "@/pages/tools/transcode/audio-params";
import { VideoParams } from "@/pages/tools/transcode/video-params";
import { Media, audioFormatList, videoFormatList } from "@/config/constant";
import { MediaData } from "@/atoms/task";

interface MediaListProps {
  kind: Media;
}

function getExtensionList(kind: Media) {
  if (kind === Media.Video) {
    return videoFormatList;
  }
  if (kind === Media.Audio) {
    return audioFormatList;
  }
  return [];
}

export function MediaList({ kind }: MediaListProps) {
  const extensions = useRef<string[]>(getExtensionList(kind));
  const parentRef = useRef<HTMLDivElement>(null);
  const [ids, setIds] = useState<string[]>([]);
  const [files, setFiles] = useImmer<MediaData[]>([]);

  useEffect(() => {
    setIds([...new Set(files.map((v) => v.id))]);
  }, [files]);

  const rowVirtualizer = useVirtualizer({
    count: files.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 96, // 每行大约高度
    overscan: 5,
    getItemKey: (index) => files[index].id,
  });

  const handleClear = useCallback(() => {
    log.debug("handleClear");
    setFiles((draft) => {
      draft.length = 0;
    });
  }, []);

  const handleAdd = useCallback((list: MediaData[]) => {
    setFiles((draft) => {
      draft.push(...list);
    });
  }, []);

  const handleDel = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const index = parseInt(e.currentTarget.dataset.index || "-1");
    if (index < 0) {
      log.error(`handleDel: index => ${index}`);
      return;
    }
    setFiles((draft) => {
      if (draft[index]) {
        draft.splice(index, 1);
      }
    });
  }, []);

  const handlePlay = useCallback(async (e: React.MouseEvent<HTMLElement>) => {
    const { path } = e.currentTarget.dataset;
    if (!path) {
      log.error(`handlePlay: path => ${path}`);
      return;
    }
    await command.openWith(path);
  }, []);

  return (
    <div className="container mx-auto h-full max-w-5xl space-y-2 bg-background p-2">
      <div className="flex items-center justify-between p-2">
        <AddFiles extensions={extensions.current} ids={ids} onSelect={handleAdd} />
        <Button onClick={handleClear} variant="destructive">
          <Trash2 className="h-4 w-4" />
          清空列表
        </Button>
      </div>

      <div className="rounded-md border">
        {/* Virtualized List */}
        <div ref={parentRef} className="h-[540px] overflow-auto contain-strict">
          <div className="relative w-full" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const file = files[virtualRow.index];
              return (
                <div
                  key={file.id}
                  className="absolute left-0 top-0 flex w-full items-center border-b"
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}>
                  <div className="flex w-full items-center justify-center">
                    <div className="flex w-48 items-center justify-center">
                      <div className="relative h-20 w-32 overflow-hidden rounded-md border bg-muted">
                        {/* <img src={file.thumbnail} alt="" className="object-cover" /> */}
                        <div
                          data-path={file.filepath}
                          onClick={handlePlay}
                          className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-transparent">
                          {kind === Media.Audio && (
                            <FileAudio2 className="h-12 w-12 text-gray-500" />
                          )}
                        </div>
                        {kind === Media.Video && (
                          <video
                            preload="auto"
                            src={core.convertFileSrc(file.filepath)}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold">{file.filename}</h3>
                      <div className="flex h-5 items-center space-x-4 text-sm text-gray-400">
                        <div className="flex-1">格式: {file.extension}</div>
                        <div className="flex-1">
                          {kind === Media.Video
                            ? `分辨率: ${file.resolution}`
                            : `比特率: ${file.bitRate}`}
                        </div>
                      </div>
                      <div className="flex h-5 items-center space-x-4 text-sm text-gray-400">
                        <div className="flex-1">时长: {file.time}</div>
                        <div className="flex-1">大小: {file.size}</div>
                      </div>
                    </div>
                    {/* <div>{file.resolution}</div>
                    <div>{file.duration}</div>
                    <div>{file.size}</div> */}
                    <div className="flex w-48 items-center gap-2">
                      {/* <Button
                        size="sm"
                        className="gap-1 bg-teal-500 hover:bg-teal-600"
                        data-index={virtualRow.index}
                        onClick={handleStart}>
                        <Upload className="h-4 w-4" />
                        转换
                      </Button> */}
                      {/* <VideoParamsDialog /> */}
                      {kind === Media.Audio && <AudioParams title="转换" data={file} />}
                      {kind === Media.Video && <VideoParams title="转换" data={file} />}
                      <Button
                        size="sm"
                        variant="destructive"
                        data-index={virtualRow.index}
                        onClick={handleDel}>
                        <Trash2 className="h-4 w-4" />
                        删除
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end p-2">
        {kind === Media.Audio && <AudioParams title="全部转换" list={files} />}
        {kind === Media.Video && <VideoParams title="全部转换" list={files} />}
      </div>
    </div>
  );
}
