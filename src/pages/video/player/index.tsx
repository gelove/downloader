import { useCallback } from "react";
import { useLocation } from "react-router-dom";

import { Player } from "@/components/common/player";
import { core, webviewWindow } from "@/lib/tauri";

function getQueryParams(search: string) {
  const params = new URLSearchParams(search);
  return params.get("file") || "";
}

export default function PlayerPage() {
  const { search } = useLocation();
  const filepath = getQueryParams(search);

  const close = useCallback(() => {
    const win = webviewWindow.getCurrentWebviewWindow();
    win.hide();
  }, []);

  return <Player filepath={core.convertFileSrc(filepath)} close={close} />;
}
