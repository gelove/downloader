import { audioFormatList, videoFormatList } from "@/config/constant";

export function isNil(value: any): value is null | undefined {
  return value === null || value === undefined;
}

export function isRegExp(value: any): value is RegExp {
  return Object.prototype.toString.call(value) === "[object RegExp]";
}

export function isArr(value: any): value is Array<any> {
  return Array.isArray(value);
}

export function isFn(value: any): value is Function {
  return typeof value === "function";
}

/**
 * 根据后缀判断是否是视频
 *
 * @param {string} suffix 后缀
 * @returns boolean
 */
export function isVideo(suffix: string): boolean {
  return videoFormatList.includes(suffix);
}

/**
 * 根据后缀判断是否是视频
 *
 * @param {string} suffix 后缀
 * @returns boolean
 */
export function isAudio(suffix: string): boolean {
  return audioFormatList.includes(suffix);
}
