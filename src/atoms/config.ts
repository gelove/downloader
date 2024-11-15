import { atomWithImmer } from "jotai-immer";

export interface Config {
  app: App;
  douyin: Douyin;
  tiktok: Tiktok;
}

export interface App {
  download_dir: string;
}

export interface Douyin {
  cookie: string;
  max_connections: number;
  max_counts: number;
  max_retries: number;
  max_tasks: number;
  page_counts: number;
  timeout: number;
  naming: string;
  lyric: string;
  interval: string;
  proxies: Proxies;
  headers: Headers;
  model: Model;
  ms_token: MsToken;
  ttwid: Ttwid;
  webid: Webid;
}

export interface Proxies {
  http: string;
  https: string;
}

export interface Headers {
  user_agent: string;
  referer: string;
}

export interface Model {
  version: Version;
  browser: Browser;
  engine: Engine;
  os: Os;
}

export interface Version {
  code: string;
  name: string;
}

export interface Browser {
  language: string;
  platform: string;
  name: string;
  version: string;
}

export interface Engine {
  name: string;
  version: string;
}

export interface Os {
  name: string;
  version: string;
}

export interface MsToken {
  url: string;
  magic: number;
  version: number;
  data_type: number;
  str_data: string;
}

export interface Ttwid {
  url: string;
  data: string;
}

export interface Webid {
  url: string;
  body: Body;
}

export interface Body {
  app_id: number;
  referer: string;
  url: string;
  user_agent: string;
  user_unique_id: string;
}

export interface Tiktok {
  cookie: string;
  max_connections: number;
  max_counts: number;
  max_retries: number;
  max_tasks: number;
  page_counts: number;
  timeout: number;
  naming: string;
  interval: string;
}

export const configAtom = atomWithImmer<Config | undefined>(undefined);
