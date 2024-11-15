import { file, log, types, time, utils } from "@/lib";
import { dialog, path, command } from "@/lib/tauri";
import { MediaData } from "@/atoms/task";
import { Media } from "@/config/constant";

export interface MediaRoot {
  media: MediaWithTrack;
}

export interface MediaWithTrack {
  "@ref": string;
  track: Track[];
}

export interface Track {
  "@type": string;
  VideoCount?: string;
  AudioCount?: string;
  FileExtension?: string;
  Format: string;
  Format_Profile?: string;
  CodecID: string;
  CodecID_Compatible?: string;
  FileSize?: string;
  Duration: string;
  OverallBitRate?: string;
  FrameRate: string;
  FrameCount: string;
  StreamSize: string;
  HeaderSize?: string;
  DataSize?: string;
  FooterSize?: string;
  IsStreamable?: string;
  File_Modified_Date?: string;
  File_Modified_Date_Local?: string;
  extra: Extra;
  StreamOrder?: string;
  ID?: string;
  Format_Level?: string;
  Format_Settings_CABAC?: string;
  Format_Settings_RefFrames?: string;
  BitRate?: string;
  Width?: string;
  Height?: string;
  Stored_Width?: string;
  Sampled_Width?: string;
  Sampled_Height?: string;
  PixelAspectRatio?: string;
  DisplayAspectRatio?: string;
  Rotation?: string;
  FrameRate_Mode?: string;
  FrameRate_Mode_Original?: string;
  FrameRate_Num?: string;
  FrameRate_Den?: string;
  ColorSpace?: string;
  ChromaSubsampling?: string;
  BitDepth?: string;
  ScanType?: string;
  colour_description_present?: string;
  colour_description_present_Source?: string;
  colour_range?: string;
  colour_range_Source?: string;
  colour_primaries?: string;
  colour_primaries_Source?: string;
  transfer_characteristics?: string;
  transfer_characteristics_Source?: string;
  matrix_coefficients?: string;
  matrix_coefficients_Source?: string;
  Format_Commercial_IfAny?: string;
  Format_Settings_SBR?: string;
  Format_Settings_PS?: string;
  Format_AdditionalFeatures?: string;
  Source_Duration?: string;
  Source_Duration_LastFrame?: string;
  BitRate_Mode?: string;
  Channels?: string;
  ChannelPositions?: string;
  ChannelLayout?: string;
  SamplesPerFrame?: string;
  SamplingRate?: string;
  SamplingCount?: string;
  Source_FrameCount?: string;
  Compression_Mode?: string;
  Source_StreamSize?: string;
  Default?: string;
  AlternateGroup?: string;
}

export interface Extra {
  comment?: string;
  encoder?: string;
  CodecConfigurationBox?: string;
  Source_Delay?: string;
  Source_Delay_Source?: string;
  mdhd_Duration?: string;
}

export function parseData(filepath: string, stdout: string) {
  const res: MediaRoot = JSON.parse(stdout);
  const tracks = res.media.track;
  if (tracks.length < 2) {
    log.warn(`媒体文件(${filepath})无有效轨道`);
    return;
  }
  const [general] = tracks;
  // 截取路径得到文件名（不包含后缀）
  // const filename = await path.basename(item);
  // 截取字符串得到后缀，也是文件格式
  // const extension = await path.extname(item);
  // 将本地媒体路径转换成可以在前端直接访问的路径
  // const src = core.convertFileSrc(item);
  // log.info("item =>", item, filename, extension, src);
  const filename = file.getName(filepath);
  // const extension = general.FileExtension?.toLowerCase() || "";
  const extension = file.getExt(filepath);
  let kind = Media.Other;
  let track: Track | undefined;
  switch (true) {
    case types.isAudio(extension || ""):
      kind = Media.Audio;
      track = tracks.find((v) => v["@type"] === "Audio");
      break;
    case types.isVideo(extension || ""):
      kind = Media.Video;
      track = tracks.find((v) => v["@type"] === "Video");
      break;
    default:
      log.warn(`未知媒体类型(${extension})`);
      break;
  }
  if (!track) {
    log.warn(`媒体文件(${filepath})无有效轨道`);
    return;
  }
  // 时长秒数浮点数
  const duration = parseFloat(general.Duration);
  return {
    id: utils.sha1(filepath),
    kind,
    filepath,
    filename,
    extension,
    size: utils.byteConversion(parseInt(general.FileSize || "0")),
    time: time.formatDuration(duration * 1000),
    duration,
    width: parseInt(track.Width || "0"),
    height: parseInt(track.Height || "0"),
    bitRate: track.BitRate ? `${Math.floor(parseInt(track.BitRate) / 1000)}K` : "",
    resolution: track.Width && track.Height ? `${track.Width}x${track.Height}` : "",
  } as MediaData;
}

/**
 * 选择文件并解析
 *
 * @param extensions 可选文件扩展名（区分视频和音频）
 */
export async function selectFiles(extensions: string[]) {
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
  if (!selected || selected.length === 0) {
    return;
  }

  const asyncTask = async (filepath: string) => {
    const res = await command.getMediaInfo(filepath);
    if (res.code !== 0) {
      log.error(`获取媒体信息失败(${res.code}) => ${res.stderr}`);
      return;
    }
    return parseData(filepath, res.stdout);
  };

  // 并发处理 无序
  // const promises: Promise<MediaData | undefined>[] = [];
  // selected.forEach((item) => {
  //   promises.push(asyncTask(item));
  // });
  // const list = await Promise.all(promises);
  // return list.filter((v) => v) as MediaData[];

  // 顺序处理
  const list: MediaData[] = [];
  for (const item of selected) {
    const data = await asyncTask(item);
    data && list.push(data);
  }
  return list;
}
