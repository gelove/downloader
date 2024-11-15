import { useCallback, useEffect, useRef } from "react";
import mediaInfoFactory, { type MediaInfo, type ReadChunkFunc } from "mediainfo.js";

import { Button } from "@/components/ui";
import { dialog, fs, path } from "@/lib/tauri";
import { log } from "@/lib";
import { parseData } from "@/lib/media";
import { Plus } from "@/components/common/icons";
import { MediaData } from "@/atoms/task";

// tauri fs 实现的 makeReadChunk
function makeReadChunkByFs(file: fs.FileHandle): ReadChunkFunc {
  return async (chunkSize: number, offset: number) => {
    // log.info("makeReadChunk", chunkSize, offset);
    await file.seek(offset, fs.SeekMode.Start);
    const data = new Uint8Array(chunkSize);
    await file.read(data);
    return data;
  };
}

type AddFilesProps = {
  extensions: string[];
  ids: string[];
  onSelect: (list: MediaData[]) => void;
};

export function AddFiles({ extensions, ids, onSelect }: AddFilesProps) {
  const mediaInfoRef = useRef<MediaInfo<"JSON">>();

  useEffect(() => {
    mediaInfoFactory({ format: "JSON" })
      .then((value) => {
        mediaInfoRef.current = value;
      })
      .catch(log.error);

    return () => {
      if (mediaInfoRef.current) {
        mediaInfoRef.current.close();
      }
    };
  }, []);

  const handleClick = useCallback(async () => {
    const selected = await dialog.open({
      multiple: true,
      filters: [
        {
          name: "选择媒体文件",
          extensions,
        },
      ],
      defaultPath: await path.downloadDir(),
    });
    // log.debug("selected =>", selected);
    if (!selected || selected.length === 0) {
      return;
    }
    const list: MediaData[] = [];
    for (const item of selected) {
      if (item && mediaInfoRef.current) {
        try {
          const file = await fs.open(item, { read: true, write: false });
          const fileInfo = await file.stat();
          log.info("fileInfo =>", fileInfo);
          const stdout = await mediaInfoRef.current.analyzeData(
            fileInfo.size,
            makeReadChunkByFs(file),
          );
          const data = parseData(item, stdout);
          if (!data || ids.includes(data.id)) {
            continue;
          }
          list.push(data);
        } catch (error) {
          log.error("mediaInfo analyzeData error", error);
        }
      }
    }
    onSelect(list);
  }, [extensions, ids, mediaInfoRef]);

  return (
    <Button onClick={handleClick} className="bg-teal-500 hover:bg-teal-600">
      <Plus className="h-4 w-4" />
      添加文件
    </Button>
  );
}
