import { invoke } from "@tauri-apps/api/core";
import { type as getType } from "@tauri-apps/plugin-os";
import { appConfigDir, resolve } from "@tauri-apps/api/path";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Command, open } from "@tauri-apps/plugin-shell";
import { Media, original, VideoOrientation } from "@/config/constant";
import { file, log } from "@/lib";
import { MediaData } from "@/atoms/task";

export enum CmdStatus {
  Progress = "Progress", // 执行中
  Finished = "Finished", // 执行完成
  Closed = "Closed", // 已关闭
  Error = "Error", // 执行错误
}

export type ProgressResult = {
  id: string;
  progress?: number;
  status: CmdStatus;
  value?: string;
  error?: string;
};

export async function getVideosToBeUploaded(dirname: string) {
  return await invoke("get_videos_to_upload", {
    dirname,
  });
}

/**
 * 打开文件路或URL
 * @param path 要打开的路径或 URL
 * @param app 要打开的应用名称
 */
export async function openWith(path: string, app?: string) {
  return await open(path, app);
}

function ffmpegProgress(
  cmd: Command<string>,
  action: string,
  id: string,
  dest: string,
  duration: number,
): Command<string> {
  const appWindow = getCurrentWebviewWindow();

  // 命令执行结束时触发
  cmd.on("close", (_data) => {
    log.info(`${action} ffmpegProgress close`);
    appWindow.emit(action, {
      id,
      status: CmdStatus.Closed,
    });
  });

  // 命令执行错误时候触发
  cmd.on("error", (error) => {
    appWindow.emit(action, {
      id,
      status: CmdStatus.Error,
      error,
    });
  });

  // 标准输出, 行缓冲, 不实时输出
  cmd.stdout.on("data", (line) => {
    log.info(`${action} stdout data line => ${line}`);
  });

  // 标准错误, 无缓冲, 实时输出, 执行 ffmpeg 时指定输出到 stderr 可以实时获取进度
  cmd.stderr.on("data", (line) => {
    // log.debug('stderr data line =>', line);
    // 通过输出字段获取时间
    if (line.includes("out_time_us=")) {
      // 截取获取微秒数
      const time = line.split("=")[1];
      // 通过转换为秒与媒体总时长来计算百分比
      const _duration = parseInt(time) / 1000000;
      // log.info("_duration =>", _duration);
      // 计算得到进度比例
      const progress = (_duration / duration) * 100;
      log.info(`${action}: progress => ${progress}`);
      // 转换为以%号显示的数值
      appWindow.emit(action, {
        id,
        progress,
        status: CmdStatus.Progress,
      });
    }

    // 转码结束赋值为100%
    if (line.includes("progress=end")) {
      log.info(`${action} ffmpegProgress end`);
      appWindow.emit(action, {
        id,
        progress: 100,
        status: CmdStatus.Finished,
        value: dest,
      });
    }
  });

  return cmd;
}

/**
 * 执行已嵌入的外部可执行文件
 * alternatively, use `window.__TAURI__.shell.Command`
 * `bin/my-sidecar` is the EXACT value specified on `tauri.conf.json > bundle > externalBin`
 * @example
 * ```typescript
 * import { Command } from "@tauri-apps/plugin-shell";
 * const sidecar_command = Command.sidecar("bin/my-sidecar");
 * const output = await sidecar_command.execute();
 * ```
 * @returns 命令对象
 */
export function aiToolCmd(dirname: string, modelPath: string) {
  // return Command.create("bin/ai_tool", [dirname, "-m", modelPath]);
  return Command.sidecar("bin/ai_tool", [dirname, "-m", modelPath]);
}

// 执行 python 可执行文件 ai_tool or ai_tool.exe
// 利用 AI 处理视频实现语言转换和嘴唇同步
export async function execAiTool(dirname: string) {
  const modelPath = await resolve(await appConfigDir(), "models", "large-v3");
  const command = aiToolCmd(dirname, modelPath);
  const appWindow = getCurrentWebviewWindow();

  // 命令执行结束时触发
  command.on("close", (data) => {
    log.debug("close =>", data);
    appWindow.emit("execAiTool", {
      type: CmdStatus.Closed,
      message: "",
    });
  });

  // 命令执行错误时候触发
  command.on("error", (error) => {
    // message(error, { title: 'Error', kind: 'error' });
    appWindow.emit("execAiTool", {
      type: CmdStatus.Error,
      message: error,
    });
  });

  // 标准输出, 行缓冲, 不实时输出
  command.stdout.on("data", (line) => {
    // log.debug('stdout data line =>', line);
    appWindow.emit("execAiTool", {
      type: CmdStatus.Progress,
      message: line,
    });
  });

  // 标准错误, 无缓冲, 实时输出 执行ffmpeg时指定输出到stderr可以实时获取进度
  command.stderr.on("data", (line) => {
    // log.debug('stderr data line =>', line);
    appWindow.emit("execAiTool", {
      type: CmdStatus.Progress,
      message: line,
    });
  });

  // 作为子进程执行命令, 并返回句柄
  return await command.spawn();
}

export function uploadVideoCmd(video: any) {
  const cmdArr = [
    "-filename",
    video.filename,
    "-title",
    video.title,
    "-description",
    video.title,
    "-caption",
    video.captions.join(","),
  ];
  return Command.sidecar("bin/uploader", cmdArr);
}

export async function uploadVideo(video: any) {
  const command = uploadVideoCmd(video);
  const appWindow = getCurrentWebviewWindow();

  // 命令执行结束时触发
  command.on("close", (data) => {
    log.debug("close =>", data);
    appWindow.emit("uploadVideo", {
      type: CmdStatus.Finished,
      message: "",
    });
  });

  // 命令执行错误时候触发
  command.on("error", (error) => {
    // message(error, { title: 'Error', kind: 'error' });
    appWindow.emit("uploadVideo", {
      type: CmdStatus.Error,
      message: error,
    });
  });

  // 标准输出, 行缓冲, 不实时输出
  command.stdout.on("data", (line) => {
    // log.debug('stdout data line =>', line);
    appWindow.emit("uploadVideo", {
      type: CmdStatus.Progress,
      message: line,
    });
  });

  // 标准错误, 无缓冲, 实时输出
  command.stderr.on("data", (line) => {
    // log.debug('stderr data line =>', line);
    appWindow.emit("uploadVideo", {
      type: CmdStatus.Progress,
      message: line,
    });
  });

  // 作为子进程执行命令, 等待任务完成并收集所有输出
  // return await command.execute();

  // 作为子进程执行命令, 并返回句柄
  return await command.spawn();
}

/**
 * 获取媒体文件信息
 *
 * @param filepath 文件路径
 * @returns 命令行对象
 */
export async function getMediaInfo(filepath: string) {
  // mediainfo --Output=JSON filename.mp4
  const cmdArr = ["--Output=JSON"];
  cmdArr.push(filepath);
  return await Command.create("mediainfo", cmdArr).execute();
}
// export function getMediaInfo(filepath: string) {
//   // ffprobe -v quiet -show_format -show_streams -print_format json input.mp4
//   const cmd = `-v quiet -show_format -show_streams -print_format json`;
//   const cmdArr = cmd.split(" ");
//   cmdArr.push(filepath);
//   return await Command.sidecar("bin/ffprobe", cmdArr).execute();
// }

/**
 * 视频竖屏转横屏 (左右添加模糊背景 原宽度=>高度 原高度=>宽度)
 *
 * @param src 本地文件路径 source
 * @param dest 输出文件路径 destination
 * @param width 视频宽度
 * @param height 视频高度
 * @example
 * ```ffmpeg
 * 视频竖屏转横屏
 *
 * ffmpeg -i input.mp4 -vf "split[a][b];[a]scale=iw/10:-2,boxblur=10:5,scale=1920:1080,setsar=1[bg];[b]scale=-2:1080[fg];[bg][fg]overlay=(W-w)/2:0" -c:v libsvtav1 -preset veryfast -progress pipe:2 output.mp4 -y
 * ffmpeg -i input.mp4 -vf "split[a][b];[a]scale=ih:iw,setsar=1,boxblur=10:5[bg];[b]scale=-2:iw[fg];[bg][fg]overlay=(W-w)/2:0" -c:v libsvtav1 -preset veryfast -progress pipe:2 output.mp4 -y
 * ```
 * @returns 命令行对象
 */
export function videoToLandscapeCmd(
  src: string,
  dest: string,
  width: number = 1280,
  height: number = 720,
) {
  const cmdArr = ["-i"];
  cmdArr.push(src);
  cmdArr.push("-vf");
  // 直接宽高互换缩放加模糊作为背景 慢速
  // const filter = `split[a][b];[a]scale=ih:iw,setsar=1,boxblur=10:5[bg][bg];[b]scale=-2:${height}[fg];[bg][fg]overlay=(W-w)/2:0`;
  // 缩小10倍并添加模糊效果作为背景 快速
  const filter = `split[a][b];[a]scale=iw/10:-2,boxblur=10:5,scale=${width}:${height},setsar=1[bg];[b]scale=-2:${height}[fg];[bg][fg]overlay=(W-w)/2:0`;
  // 背景视频宽度与高度互换, 前景视频高度度缩放到原视频宽度
  cmdArr.push(filter);
  // const rest = "-c:v libsvtav1 -crf 18 -aspect 16:9 -f mp4 -preset veryfast -progress pipe:2";
  const rest = "-c:v libx264 -progress pipe:2";
  cmdArr.push(...rest.split(" "));
  cmdArr.push(dest);
  cmdArr.push("-y");
  if (getType() === "macos") {
    return Command.sidecar("bin/ffmpeg", cmdArr);
  }
  return Command.create("ffmpeg", cmdArr);
}

/**
 * 视频横屏转竖屏（上下添加模糊背景 原宽度=>高度 原高度=>宽度）
 * ffmpeg -i input.mp4 -vf "split[a][b];[a]scale=iw/10:-2,boxblur=10:5,scale=1080:1980,setsar=1[bg];[b]scale=1080:-2[fg];[bg][fg]overlay=0:(H-h)/2" -c:v libsvtav1 -crf 18 -aspect 9:16 -f mp4 -preset veryfast -progress pipe:2 output.mp4 -y
 * ffmpeg -i 7430422553807572259.mp4 -vf "split[a][b];[a]scale=iw/10:-2,boxblur=10:5,scale=1080:1980,setsar=1[bg];[b]scale=1080:-2[fg];[bg][fg]overlay=0:(H-h)/2" -c:v libsvtav1 -crf 18 -aspect 9:16 -f mp4 -preset veryfast -progress pipe:2 output.mp4 -y
 * 命令说明:
 * split[a][b] - 将输入视频分成两个流
 * [a]scale=iw/10:-2,boxblur=10:5,scale=1080:1980,setsar=1[bg] - 第一个流缩小10倍并添加模糊效果然后强制缩放为输出视频大小作为背景
 * [b]scale=1080:-2[fg] - 第二个流宽度改为原视频高度, 高度保持原始比例作为前景
 * [bg][fg]overlay=0:(H-h)/2 - 将前景视频居中叠加到模糊背景上
 * -aspect 9:16 - 设置最终输出为竖屏比例
 *
 * 上下只加黑边不添加模糊效果
 * ffmpeg -i input.mp4 -vf "scale=ih:-2,pad=iw:iw*16/9:0:(oh-ih)/2" output.mp4 -y
 * scale=ih:-2 - ih表示缩放视频宽度为原视频高度, -2表示高度保持原视频比例并保证值为偶数
 * pad=iw:iw*16/9:0:(oh-ih)/2 - 宽度不变, 高度为宽度的16/9, x轴为0, y轴向下平移(oh-ih)/2, 使得视频居中
 */
export function videoToPortraitCmd(
  src: string,
  dest: string,
  width: number = 720,
  height: number = 1280,
) {
  const cmdArr = ["-i"];
  cmdArr.push(src);
  cmdArr.push("-vf");
  const filter = `split[a][b];[a]scale=iw/10:-2,boxblur=10:5,scale=${width}:${height},setsar=1[bg];[b]scale=${width}:-2[fg];[bg][fg]overlay=0:(H-h)/2`;
  cmdArr.push(filter);
  const rest = "-c:v libx264 -progress pipe:2";
  cmdArr.push(...rest.split(" "));
  cmdArr.push(dest);
  cmdArr.push("-y");
  if (getType() === "macos") {
    return Command.sidecar("bin/ffmpeg", cmdArr);
  }
  return Command.create("ffmpeg", cmdArr);
}

/**
 * 视频改变方向 (竖屏或者横屏)
 * @param video 视频对象
 * @param width 视频宽度
 * @param height 视频高度
 */
export async function videoChangeOrientation(
  taskId: string,
  video: MediaData,
  orientation: VideoOrientation,
  dest?: string,
) {
  const { duration, filepath } = video;
  if (!dest) {
    dest = filepath;
  }
  dest = await invoke<string>("get_output_filepath", { dest });
  // log.debug('videoToLandscape =>', index);
  let cmd = null;
  switch (orientation) {
    case VideoOrientation.Landscape:
      cmd = videoToLandscapeCmd(filepath, dest);
      break;
    case VideoOrientation.Portrait:
      cmd = videoToPortraitCmd(filepath, dest);
      break;
    default:
      break;
  }
  if (!cmd) {
    return;
  }

  cmd = ffmpegProgress(cmd, "videoChangeOrientation", taskId, dest, duration);

  // 作为子进程执行命令, 并返回句柄
  const child = await cmd.spawn();
  // 将进程对象保存至数组
  return child;
}

/**
 * 提取音频
 * ffmpeg -i input.mp4 -vn -c:a copy -progress pipe:2 output.aac
 * ffmpeg -i input.mp4 -vn -b:a 128k -ar 44100 -c:a mp3 -progress pipe:2 output.mp3
 */
export function extractAudioCmd(
  src: string,
  ext: string = "aac",
  bitRate?: string,
  sampleRate?: string,
) {
  // const filepath = await invoke<string>("get_output_filepath", { dest });
  const cmdArr = ["-i"];
  cmdArr.push(src);
  cmdArr.push("-vn");
  if (bitRate) {
    cmdArr.push("-b:a");
    cmdArr.push(bitRate);
  }
  if (sampleRate) {
    cmdArr.push("-ar");
    cmdArr.push(sampleRate);
  }
  cmdArr.push("-c:a");
  if (ext === "mp3") {
    cmdArr.push("mp3");
  } else {
    cmdArr.push("copy");
  }
  cmdArr.push("-progress");
  cmdArr.push("pipe:2");
  cmdArr.push(file.replaceExt(src, ext));
  cmdArr.push("-y");
  if (getType() === "macos") {
    return Command.sidecar("bin/ffmpeg", cmdArr);
  }
  return Command.create("ffmpeg", cmdArr);
}

/**
 * 提取视频部分
 * ffmpeg -i input.mp4 -an -c:v copy -ss 00:00:00 -t 00:00:10 -progress pipe:2 output.mp4 -y
 */
export function extractVideoCmd(src: string, dest: string, start?: string, duration?: string) {
  const cmdArr = ["-i"];
  cmdArr.push(src);
  cmdArr.push("-an"); // 去除音频流
  cmdArr.push("-c:v");
  cmdArr.push("copy");
  if (start) {
    cmdArr.push("-ss");
    cmdArr.push(start);
  }
  if (duration) {
    cmdArr.push("-t");
    cmdArr.push(duration);
  }
  cmdArr.push("-progress");
  cmdArr.push("pipe:2");
  cmdArr.push(dest);
  cmdArr.push("-y");
  if (getType() === "macos") {
    return Command.sidecar("bin/ffmpeg", cmdArr);
  }
  return Command.create("ffmpeg", cmdArr);
}

/**
 * 分离视频和音频
 * ffmpeg -i 7424518630265605376.mp4 -c copy -an output_video.mp4 -vn -c:a copy -progress pipe:2 output_audio.aac -y
 * ffmpeg -i 7424518630265605376.mp4 -c copy -an output_video.mp4 -vn -c:a mp3 -progress pipe:2 output_audio.mp3 -y
 *
 * @param src
 * @param dest
 */
export function splitVideoAndAudioCmd(src: string, dest: string, audioExt: string = "aac") {
  // if (!dest) {
  //   dest = src;
  // }
  // const filepath = await invoke<string>("get_output_filepath", { dest });
  const cmdArr = ["-i"];
  cmdArr.push(src);
  cmdArr.push("-c");
  cmdArr.push("copy");
  cmdArr.push("-an");
  cmdArr.push(dest);
  cmdArr.push("-vn");
  cmdArr.push("-c:a");
  if (audioExt === "mp3") {
    cmdArr.push("mp3");
  } else {
    cmdArr.push("copy");
  }
  cmdArr.push("-progress");
  cmdArr.push("pipe:2");
  cmdArr.push(file.replaceExt(dest, audioExt));
  cmdArr.push("-y");
  log.debug("splitVideoAndAudioCmd cmdArr =>", cmdArr.join(" "));
  if (getType() === "macos") {
    return Command.sidecar("bin/ffmpeg", cmdArr);
  }
  return Command.create("ffmpeg", cmdArr);
}

// 分离视频与音频
export async function splitVideoAndAudio(
  taskId: string,
  data: MediaData,
  audioExt: string = "aac",
  dest?: string,
) {
  const { duration, filepath } = data;
  if (!dest) {
    dest = file.addSuffix(filepath, "_split");
  }
  let cmd = splitVideoAndAudioCmd(filepath, dest, audioExt);
  if (!cmd) {
    throw new Error(`{分离音视频}命令创建失败`);
  }
  cmd = ffmpegProgress(cmd, "splitVideoAndAudio", taskId, dest, duration);
  return await cmd.spawn();
}

/**
 * 添加合并音频
 */
export function mergeAudioCmd(video: string, audio: string, dest: string, time?: number) {
  // 视频变小了 似乎被压缩了
  // ffmpeg -i audio.m4a -i video.mp4 output.mp4 -y
  // -t 8 : 指定时长8(秒)
  // ffmpeg -i audio.m4a -i video.mp4 -t 8 output.mp4 -y
  // 视频大小与原始视频大小一致
  // -c copy : 音视频都只拷贝, 不编解码, 等于 -c:v copy -c:a copy
  // -c:v copy : 视频只拷贝, 不编解码
  // -c:a copy : 音频只拷贝, 不编解码
  // output.mp4 : 新生成的文件, 文件的长度由两个输入文件中最长的决定
  // ffmpeg -i audio.m4a -i video.mp4 -c copy -progress pipe:2 output.mp4 -y
  // 构建视频转换命令
  const cmdArr: string[] = [];
  cmdArr.push("-i");
  cmdArr.push(audio);
  cmdArr.push("-i");
  cmdArr.push(video);
  cmdArr.push("-c");
  cmdArr.push("copy");
  if (time && time > 0) {
    cmdArr.push("-t");
    cmdArr.push(time.toString());
  }
  cmdArr.push("-progress");
  cmdArr.push("pipe:2");
  cmdArr.push(dest);
  cmdArr.push("-y");
  if (getType() === "macos") {
    return Command.sidecar("bin/ffmpeg", cmdArr);
  }
  return Command.create("ffmpeg", cmdArr);
}

export async function mergeAudio(
  taskId: string,
  data: MediaData,
  audio: string,
  dest?: string,
  time?: number,
) {
  const { duration, filepath } = data;
  if (!dest) {
    dest = filepath;
  }
  dest = await invoke<string>("get_output_filepath", { dest });
  let cmd = mergeAudioCmd(filepath, audio, dest, time);
  if (!cmd) {
    log.error(`{合并音频}命令创建失败`);
    return;
  }
  cmd = ffmpegProgress(cmd, "mergeAudio", taskId, dest, duration);
  return await cmd.spawn();
}

/**
 * 视频转码
 *
 * @param src 本地文件路径 source
 * @param dest 输出文件路径 destination
 * @param resolution 转换分辨率
 * @example
 * ```ffmpeg
 * ffmpeg -i input.mp4 -s 1920x1080 -progress pipe:2 output.mp4
 * ```
 * @returns 命令行对象
 */
export function videoTranscodeCmd(src: string, dest: string, resolution: string) {
  if (!src || !dest || !resolution) {
    log.error(`videoTranscodeCmd 参数错误 src=${src}, dest=${dest}, resolution=${resolution}`);
    return;
  }
  // 获取输出路径（需要检测重复文件名）
  // const filepath = await invoke<string>("get_output_filepath", { dest });
  // 构建视频转换命令
  const cmdArr = ["-i"];
  cmdArr.push(src);
  if (resolution && resolution !== original) {
    cmdArr.push("-s");
    cmdArr.push(resolution);
  }
  cmdArr.push("-progress");
  cmdArr.push("pipe:2");
  cmdArr.push(dest);
  cmdArr.push("-y");
  if (getType() === "macos") {
    return Command.sidecar("bin/ffmpeg", cmdArr);
  }
  return Command.create("ffmpeg", cmdArr);
}

/**
 * 音频转码
 *
 * @param src 本地文件路径 source
 * @param dest 输出文件路径 destination
 * @param bitRate 转换比特率
 * @example
 * ```ffmpeg
 * ffmpeg -i input.mp3 -b:v 256k -progress pipe:2 output.mp3
 * ffmpeg -i input.aac -b:v 256k -progress pipe:2 output.mp3
 * ```
 * @returns 命令行对象
 */
export function audioTranscodeCmd(src: string, dest: string, bitRate: string) {
  if (!src || !dest || !bitRate) {
    log.error(`audioTranscodeCmd 参数错误 src=${src}, dest=${dest}, bitRate=${bitRate}`);
    return;
  }
  const cmdArr = ["-i"];
  cmdArr.push(src);
  cmdArr.push("-b:v");
  cmdArr.push(bitRate);
  cmdArr.push("-progress");
  cmdArr.push("pipe:2");
  cmdArr.push(dest);
  cmdArr.push("-y");
  log.info("audioTranscodeCmd cmdArr =>", cmdArr.join(" "));
  if (getType() === "macos") {
    return Command.sidecar("bin/ffmpeg", cmdArr);
  }
  return Command.create("ffmpeg", cmdArr);
}

/**
 * 转码视频或音频
 *
 * @param data  媒体数据
 * @param format 输出文件格式
 * @param quality 转换质量
 * @param outputDir 输出目录
 * @returns 命令句柄
 */
export async function transcode(
  taskId: string,
  data: MediaData,
  format: string,
  quality: string,
  outputDir?: string,
) {
  // 媒体转换命令: progress是进度条, pipe:2是指定输出到stderr, 如果为1则表示输出到stdout
  // ffmpeg默认输出到stderr, 但进度条必须指定输出, 可以是文件或者上述的stderr或stdout
  // 示例: ffmpeg -i input.mkv -s 640x320 -progress pipe:2 output.mp4
  const { filename, filepath, duration } = data;
  if (!outputDir) {
    outputDir = file.getDir(filepath);
  }
  let dest = `${outputDir}/${filename}.${format}`;
  dest = await invoke<string>("get_output_filepath", { dest });
  log.info("transcode dest =>", dest);
  // 获取执行对象（根据数据类型来确定处理的视频还是音频）
  let cmd;
  switch (data.kind) {
    case Media.Audio:
      cmd = audioTranscodeCmd(filepath, dest, quality);
      break;
    case Media.Video:
      cmd = videoTranscodeCmd(filepath, dest, quality);
      break;
  }

  if (!cmd) {
    log.error("transcode cmd create fail");
    return;
  }

  cmd = ffmpegProgress(cmd, "transcode", taskId, dest, duration);

  // 执行命令为子进程
  const child = await cmd.spawn();
  return child;
}
