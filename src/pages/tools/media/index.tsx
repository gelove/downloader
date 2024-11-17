import { useCallback, useEffect, useRef, useState } from "react";
import mediaInfoFactory, { type MediaInfo, type ReadChunkFunc } from "mediainfo.js";

import { Button } from "@/components/ui";
import { log } from "@/lib";
import { dialog, fs, shell, path } from "@/lib/tauri";
import { videoFormatList } from "@/config/constant";

function makeReadChunk(file: File): ReadChunkFunc {
  return async (chunkSize: number, offset: number) => {
    // log.info("makeReadChunk", chunkSize, offset);
    return new Uint8Array(await file.slice(offset, offset + chunkSize).arrayBuffer());
  };
}

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

function SelectFiles({ extensions }: { extensions: string[] }) {
  const mediaInfoRef = useRef<MediaInfo<"JSON">>();
  const fileInput = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState("");

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
    for (const item of selected) {
      if (item && mediaInfoRef.current) {
        try {
          const file = await fs.open(item, { read: true, write: false });
          const fileInfo = await file.stat();
          log.info("fileInfo =>", fileInfo);
          const res = await mediaInfoRef.current.analyzeData(
            fileInfo.size,
            makeReadChunkByFs(file),
          );
          setResult(res);
        } catch (error) {
          log.error("mediaInfo analyzeData error", error);
        }
      }
    }
  }, [extensions, mediaInfoRef]);

  const handleClickInput = useCallback(() => {
    if (!fileInput.current) return;
    fileInput.current.click();
  }, []);

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      log.info("handleChange files", files);
      for (const file of files) {
        if (file && mediaInfoRef.current) {
          try {
            const res = await mediaInfoRef.current.analyzeData(file.size, makeReadChunk(file));
            setResult(res);
          } catch (error) {
            log.error("mediaInfo analyzeData error", error);
          }
        }
      }
    },
    [mediaInfoRef],
  );

  return (
    <>
      <div className="mt-2">
        <Button onClick={handleClick}>添加文件(Tauri Command)</Button>
      </div>
      <div className="mt-2">
        <Button onClick={handleClickInput}>添加文件(WASM)</Button>
        <input
          ref={fileInput}
          type="file"
          accept={extensions.join(",")}
          hidden
          multiple
          onChange={handleChange}
        />
      </div>
      <div className="mt-2">
        <pre>{result}</pre>
      </div>
    </>
  );
}

export default function Media() {
  const mediaInfoRef = useRef<MediaInfo<"JSON">>();

  useEffect(() => {
    mediaInfoFactory({ format: "JSON" })
      .then((mi) => {
        mediaInfoRef.current = mi;
      })
      .catch((error: unknown) => {
        console.error(error);
      });

    return () => {
      if (mediaInfoRef.current) {
        mediaInfoRef.current.close();
      }
    };
  }, []);

  const handleCheck = useCallback(async () => {
    let result = await shell.Command.sidecar("bin/ffmpeg", ["-version"]).execute();
    log.info(result);
  }, []);

  return (
    <div>
      <Button onClick={handleCheck}>Check FFMPEG</Button>
      <SelectFiles extensions={videoFormatList} />
    </div>
  );
}
