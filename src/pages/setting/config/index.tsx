import { useState, useEffect, useCallback, useRef, useId } from "react";
// import { useEffectOnActive } from "keepalive-for-react";

import { Button, Label, Textarea, toast } from "@/components/ui";
import { Folder, FileText } from "@/components/common/icons";
import { useConfig } from "@/hooks/use-config";
import { path, shell } from "@/lib/tauri";
import { log } from "@/lib";

export default function Setting() {
  const [configDir, setConfigDir] = useState("");
  const [douyinCookie, setDouyinCookie] = useState("");
  const domRef = useRef<HTMLDivElement>(null);
  const cookieRef = useRef<HTMLTextAreaElement>(null);
  const cookieId = useId();
  const { config, setConfig } = useConfig();

  // useEffectOnActive(
  //   () => {
  //     log.debug("Setting is active");
  //     const dom = domRef.current;
  //     if (dom) {
  //       // if transition is true, the dom size will be 0, because the dom is not rendered yet
  //       log.debug(`Setting dom size: height ${dom.clientHeight}px  width ${dom.clientWidth}px`);
  //       setTimeout(() => {
  //         log.debug(`Setting dom size: height ${dom.clientHeight}px  width ${dom.clientWidth}px`);
  //       }, 300);
  //     }
  //   },
  //   [],
  //   true,
  // );

  useEffect(() => {
    log.debug("Setting mounted");
    async function init() {
      const dir = await path.appConfigDir();
      setConfigDir(() => dir);
    }
    init();
  }, []);

  useEffect(() => {
    setDouyinCookie(config?.douyin?.cookie || "");
  }, [config]);

  const openConfigDir = useCallback(async () => {
    try {
      await shell.open(configDir);
    } catch (err) {
      log.error(err);
      toast.error("打开配置文件夹失败");
    }
  }, [configDir]);

  // const openBinDir = useCallback(async () => {
  //   try {
  //     const dir = await path.join(configDir, "bin");
  //     const isExists = await fs.exists(dir);
  //     if (!isExists) {
  //       await file.createDir(dir);
  //     }
  //     await shell.open(dir);
  //   } catch (err) {
  //     log.error(err);
  //     toast.error("打开工具文件夹失败");
  //   }
  // }, [configDir]);

  const updateDouyinCookie = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDouyinCookie(e.target.value);
  }, []);

  const saveConfig = useCallback(async () => {
    if (!config) {
      return;
    }
    log.debug("saveConfig", cookieRef.current?.value);
    const cookie = cookieRef.current?.value;
    if (!cookie) {
      toast.error("请输入抖音Cookie");
      return;
    }
    setConfig({ ...config, douyin: { ...config.douyin, cookie } });
  }, [config, setConfig]);

  return (
    <div className="flex h-full w-full flex-col items-center" ref={domRef}>
      <div ref={domRef} className="grid w-full gap-2">
        <Label htmlFor={cookieId}>抖音Cookie :</Label>
        <Textarea
          className="w-full resize-none"
          id={cookieId}
          ref={cookieRef}
          spellCheck={false}
          rows={24}
          autoCorrect="off"
          autoComplete="off"
          autoCapitalize="off"
          placeholder="输入抖音Cookie"
          value={douyinCookie}
          onChange={updateDouyinCookie}
        />
      </div>
      <div className="mt-2 grid w-full grid-cols-2 gap-2">
        <Button onClick={saveConfig}>
          <FileText size={16} />
          更新配置
        </Button>
        <Button onClick={openConfigDir}>
          <Folder size={16} />
          打开配置文件夹
        </Button>
        {/* <Button onClick={openBinDir}>
          <Folder size={16} />
          打开工具文件夹
        </Button> */}
      </div>
    </div>
  );
}
