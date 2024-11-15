import { useCallback, useEffect } from "react";
import { useAtom } from "jotai";

import { getConfig, updateConfig } from "@/lib/config";
import { Config, configAtom } from "@/atoms/config";
import { toast } from "@/components/ui";
// import { log } from "@/lib";

export const useConfig = () => {
  const [config, setter] = useAtom(configAtom);

  const initConfig = useCallback(async () => {
    const data = await getConfig();
    setter(data);
  }, [getConfig]);

  const setConfig = useCallback(async (config: Config) => {
    const res = await updateConfig(config);
    if (!res) {
      toast.error("设置配置文件失败");
    }
    setter(config);
    toast.success("设置配置文件成功");
  }, []);

  useEffect(() => {
    initConfig();
  }, [initConfig]);

  return { config, setConfig };
};
