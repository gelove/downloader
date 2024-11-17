import { useCallback, useState } from "react";
import { core } from "@/lib/tauri";
import { Button } from "@/components/ui";

type DownloadEvent = {
  event: "Started" | "Progress" | "Finished";
  data: {
    url?: string;
    downloadId: number;
    contentLength: number;
    chunkLength?: number;
  };
};

export default function Update() {
  const [progress, setProgress] = useState(0);

  const handleDownload = useCallback(async () => {
    const onEvent = new core.Channel<DownloadEvent>();
    onEvent.onmessage = (message: DownloadEvent) => {
      console.log(`got download event ${message.event}`);
      const { contentLength, chunkLength, downloadId, url } = message.data;
      console.log("handleDownload", downloadId, url);
      chunkLength && setProgress(chunkLength / contentLength);
    };

    await core.invoke("download", {
      url: "https://raw.githubusercontent.com/tauri-apps/tauri/dev/crates/tauri-schema-generator/schemas/config.schema.json",
      onEvent,
    });
  }, []);

  return (
    <div>
      <div>{progress * 100}%</div>
      <Button onClick={handleDownload}>Download</Button>
    </div>
  );
}
