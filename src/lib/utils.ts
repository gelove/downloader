import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { v7 as uuidv7 } from "uuid";
import SHA1 from "crypto-js/sha1";
import { version } from "../../package.json";

export const noop = () => {};
export const uuid = uuidv7;
export const sha1 = (v: string) => SHA1(v).toString();

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getVersion() {
  return version;
}

/**
 * 1024的n次幂
 *
 * @param {number} n
 * @returns number
 */
export function pow1024(n: number): number {
  return Math.pow(1024, n);
}

/**
 * 字节单位转换
 *
 * @param {number} size 字节大小
 * @returns 格式化单位数值
 */
export function byteConversion(size: number) {
  if (!size) return "";
  if (size < pow1024(1)) return size + " B";
  if (size < pow1024(2)) return (size / pow1024(1)).toFixed(2) + " KB";
  if (size < pow1024(3)) return (size / pow1024(2)).toFixed(2) + " MB";
  if (size < pow1024(4)) return (size / pow1024(3)).toFixed(2) + " GB";
  return (size / pow1024(4)).toFixed(2) + " TB";
}
