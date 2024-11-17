export const appName = "Luna AI";
export const storePrefix = "luna-ai-";

// const obj = {
//   k1: "foo",
//   k2: "bar",
//   k3: "baz",
// } as const;
// // type Keys = "k1" | "k2" | "k3"
// type Keys = keyof typeof obj;
// // type Keys = "foo" | "bar" | "baz"
// type Keys = (typeof obj)[keyof typeof obj];

export enum Theme {
  Dark = "dark",
  Light = "light",
  System = "system",
}
// export type ThemeType = keyof typeof Theme;
// export type ThemeType = `${Theme}`;

export enum Source {
  Douyin = "douyin",
  Tiktok = "tiktok",
}
// export type SourceType = keyof typeof Source;
export type SourceType = `${Source}`;

// export const App = "app";

// export type ConfigKey = typeof App | SourceType;

export enum Media {
  Video,
  Audio,
  Other,
}

export enum DownloadStatus {
  Initial,
  Loading,
  Done,
}

export enum LoadAll {
  Initial, //初始化
  Query, //查询全部
  Down, //下载全部
}

// 音频处理选项
export enum AudioAction {
  Split = "audioSplit",
  Remove = "audioRemove",
  Merge = "audioMerge",
}

export enum VideoOrientation {
  Portrait = "videoPortrait",
  Landscape = "videoLandscape",
}

export type TaskAction = "audioFormat" | "videoFormat" | `${VideoOrientation}` | `${AudioAction}`;

// /** 常见视频格式 */
export const videoFormats = {
  mp4: "mp4",
  mov: "mov",
  mkv: "mkv",
  avi: "avi",
  wmv: "wmv",
  m4v: "m4v",
  mpg: "mpg",
  vob: "vob",
  webm: "webm",
  ogv: "ogv",
  flv: "flv",
  f4v: "f4v",
  swf: "swf",
  "3gp": "3gp",
} as const;
export type VideoFormat = keyof typeof videoFormats;

export const videoFormatList = Object.keys(videoFormats);

// export const videoFormats = ["mp4", "mov", "mkv", "avi", "wmv", "m4v", "mpg", "vob", "webm", "ogv", "3gp", "flv", "f4v", "swf"] as const;
// type VideoFormat = (typeof videoFormats)[number];
// type VideoData = { [index in (typeof videoFormats)[number]]?: string };

// /** 常见音频格式 */
export const audioFormats = {
  mp3: "mp3",
  wav: "wav",
  m4a: "m4a",
  wma: "wma",
  aac: "aac",
  flac: "flac",
  ac3: "ac3",
  m4r: "m4r",
  ape: "ape",
  ogg: "ogg",
} as const;
export type AudioFormat = keyof typeof audioFormats;

export const audioFormatList = Object.keys(audioFormats);

export type ParamOption = { name: string; value: string };

// 原分辨率 选项值
export const original = "original";

// export type videoParamsType = {
//   [id in VideoFormat]: ParamOption[];
// };
export type VideoParamsType = Record<VideoFormat, ParamOption[]>;
/** 视频转换参数 */
export const videoParams: VideoParamsType = {
  [videoFormats.mp4]: [
    {
      name: "原分辨率",
      value: original,
    },
    {
      name: "4K Full Aperture",
      value: "4096x3112",
    },
    {
      name: "4K UHDTV",
      value: "3840X2160",
    },
    {
      name: "HD 1080P",
      value: "1920x1080",
    },
    {
      name: "HD 720P",
      value: "1280x720",
    },
    {
      name: "640P",
      value: "960x640",
    },
    {
      name: "SD 480P",
      value: "640x480",
    },
  ],
  [videoFormats.mov]: [
    {
      name: "原分辨率",
      value: original,
    },
    {
      name: "4K Full Aperture",
      value: "4096x3112",
    },
    {
      name: "4K UHDTV",
      value: "3840X2160",
    },
    {
      name: "HD 1080P",
      value: "1920x1080",
    },
    {
      name: "HD 720P",
      value: "1280x720",
    },
    {
      name: "SD 480P",
      value: "640x480",
    },
  ],
  [videoFormats.mkv]: [
    {
      name: "原分辨率",
      value: original,
    },
    {
      name: "4K Full Aperture",
      value: "4096x3112",
    },
    {
      name: "4K UHDTV",
      value: "3840X2160",
    },
    {
      name: "HD 1080P",
      value: "1920x1080",
    },
    {
      name: "HD 720P",
      value: "1280x720",
    },
    {
      name: "SD 480P",
      value: "640x480",
    },
  ],
  [videoFormats.avi]: [
    {
      name: "原分辨率",
      value: original,
    },
    {
      name: "HD 1080P",
      value: "1920x1080",
    },
    {
      name: "HD 720P",
      value: "1280x720",
    },
    {
      name: "SD 480P",
      value: "640x480",
    },
  ],
  [videoFormats.wmv]: [
    {
      name: "原分辨率",
      value: original,
    },
    {
      name: "4K Full Aperture",
      value: "4096x3112",
    },
    {
      name: "4K UHDTV",
      value: "3840X2160",
    },
    {
      name: "HD 1080P",
      value: "1920x1080",
    },
    {
      name: "HD 720P",
      value: "1280x720",
    },
    {
      name: "SD 480P",
      value: "640x480",
    },
  ],
  [videoFormats.m4v]: [
    {
      name: "原分辨率",
      value: original,
    },
    {
      name: "4K Full Aperture",
      value: "4096x3112",
    },
    {
      name: "4K UHDTV",
      value: "3840X2160",
    },
    {
      name: "HD 1080P",
      value: "1920x1080",
    },
    {
      name: "HD 720P",
      value: "1280x720",
    },
    {
      name: "SD 480P",
      value: "640x480",
    },
  ],
  [videoFormats.mpg]: [
    {
      name: "原分辨率",
      value: original,
    },
    {
      name: "HD 1080P",
      value: "1920x1080",
    },
    {
      name: "HD 720P",
      value: "1280x720",
    },
    {
      name: "SD 576P",
      value: "720x576",
    },
    {
      name: "SD 480P",
      value: "720x480",
    },
  ],
  [videoFormats.vob]: [
    {
      name: "原分辨率",
      value: original,
    },
    {
      name: "480P DVD-Video",
      value: "720x480",
    },
  ],
  [videoFormats.webm]: [
    {
      name: "原分辨率",
      value: original,
    },
    {
      name: "4K Full Aperture",
      value: "4096x3112",
    },
    {
      name: "4K UHDTV",
      value: "3840X2160",
    },
    {
      name: "HD 1080P",
      value: "1920x1080",
    },
    {
      name: "HD 720P",
      value: "1280x720",
    },
    {
      name: "SD 480P",
      value: "640x480",
    },
  ],
  [videoFormats.ogv]: [
    {
      name: "原分辨率",
      value: original,
    },
    {
      name: "HD 1080P",
      value: "1920x1080",
    },
    {
      name: "HD 720P",
      value: "1280x720",
    },
    {
      name: "SD 480P",
      value: "640x480",
    },
  ],
  [videoFormats.flv]: [
    {
      name: "原分辨率",
      value: original,
    },
    {
      name: "4K Full Aperture",
      value: "4096x3112",
    },
    {
      name: "4K UHDTV",
      value: "3840X2160",
    },
    {
      name: "HD 1080P",
      value: "1920x1080",
    },
    {
      name: "HD 720P",
      value: "1280x720",
    },
    {
      name: "SD 480P",
      value: "640x480",
    },
    {
      name: "SD 360P",
      value: "640x360",
    },
  ],
  [videoFormats.f4v]: [
    {
      name: "原分辨率",
      value: original,
    },
    {
      name: "4K Full Aperture",
      value: "4096x3112",
    },
    {
      name: "4K UHDTV",
      value: "3840X2160",
    },
    {
      name: "HD 1080P",
      value: "1920x1080",
    },
    {
      name: "HD 720P",
      value: "1280x720",
    },
    {
      name: "SD 480P",
      value: "640x480",
    },
    {
      name: "SD 360P",
      value: "640x360",
    },
  ],
  [videoFormats.swf]: [
    {
      name: "原分辨率",
      value: original,
    },
    {
      name: "4K Full Aperture",
      value: "4096x3112",
    },
    {
      name: "4K UHDTV",
      value: "3840X2160",
    },
    {
      name: "HD 1080P",
      value: "1920x1080",
    },
    {
      name: "HD 720P",
      value: "1280x720",
    },
    {
      name: "SD 480P",
      value: "640x480",
    },
    {
      name: "SD 360P",
      value: "320x240",
    },
  ],
  [videoFormats["3gp"]]: [
    {
      name: "原分辨率",
      value: original,
    },
    {
      name: "3GP2",
      value: "320x240",
    },
    {
      name: "3GP1",
      value: "176x144",
    },
  ],
} as const;

export type AudioParamsType = Record<AudioFormat, ParamOption[]>;
/** 音频转换参数 */
export const audioParams: AudioParamsType = {
  [audioFormats.mp3]: [
    {
      name: "高品质",
      value: "256k",
    },
    {
      name: "中品质",
      value: "128k",
    },
    {
      name: "低品质",
      value: "96k",
    },
  ],
  [audioFormats.wav]: [
    {
      name: "无损",
      value: "256k",
    },
  ],
  [audioFormats.m4a]: [
    {
      name: "高品质",
      value: "256k",
    },
    {
      name: "中品质",
      value: "128k",
    },
    {
      name: "低品质",
      value: "96k",
    },
  ],
  [audioFormats.wma]: [
    {
      name: "高品质",
      value: "256k",
    },
    {
      name: "中品质",
      value: "128k",
    },
    {
      name: "低品质",
      value: "96k",
    },
  ],
  [audioFormats.aac]: [
    {
      name: "高品质",
      value: "256k",
    },
    {
      name: "中品质",
      value: "128k",
    },
    {
      name: "低品质",
      value: "96k",
    },
  ],
  [audioFormats.flac]: [
    {
      name: "高品质",
      value: "256k",
    },
    {
      name: "中品质",
      value: "128k",
    },
    {
      name: "低品质",
      value: "96k",
    },
  ],
  [audioFormats.ac3]: [
    {
      name: "高品质",
      value: "256k",
    },
    {
      name: "中品质",
      value: "128k",
    },
    {
      name: "低品质",
      value: "96k",
    },
  ],
  m4r: [
    {
      name: "高品质",
      value: "256k",
    },
    {
      name: "中品质",
      value: "128k",
    },
    {
      name: "低品质",
      value: "96k",
    },
  ],
  [audioFormats.ape]: [
    {
      name: "无损",
      value: "256k",
    },
  ],
  [audioFormats.ogg]: [
    {
      name: "高品质",
      value: "256k",
    },
    {
      name: "中品质",
      value: "128k",
    },
    {
      name: "低品质",
      value: "96k",
    },
  ],
} as const;

export type DefaultConvert = {
  extension: string;
  description: string;
  dpiOrBitRate: string;
};
