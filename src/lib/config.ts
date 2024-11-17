import TOML from "smol-toml";

import { path, core } from "@/lib/tauri";
import { log } from "@/lib";
import { Config } from "@/atoms/config";

export async function appConfigFile(): Promise<string> {
  // const dir = await path.homeDir();
  // return await resolve(dir, ".luna_ai.toml");
  const dir = await path.appConfigDir();
  return await path.resolve(dir, "config.toml");
}

export async function getConfig(): Promise<Config> {
  // const file = await appConfigFile();
  // return await fs.readTextFile(file);
  const config = await core.invoke<Config>("get_config");
  // log.info("config:", config);
  // return TOML.parse(config);
  return config;
}

export async function updateConfig(config: Config): Promise<boolean> {
  try {
    await core.invoke("set_config", { content: TOML.stringify(config) });
    return true;
  } catch (error) {
    log.error("updateConfig:", error);
    return false;
  }
}
