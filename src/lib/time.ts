import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

/**
 * 格式化时长字符串
 * @param milliseconds 毫秒
 * @returns
 */
export function formatDuration(milliseconds: number) {
  const durationObj = dayjs.duration(milliseconds);
  const hours = durationObj.hours();
  const minutes = durationObj.minutes();
  const seconds = durationObj.seconds();

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  } else {
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
}

/**
 * 格式化毫秒时间戳
 * @param milliseconds 毫秒
 * @param format
 * @returns
 */
export function formatTime(milliseconds?: number, format: string = "YYYY-MM-DD HH:mm:ss") {
  return dayjs(milliseconds).format(format);
}

/**
 * 时分秒字符串转为秒
 *
 * @param {string} time 时分秒字符串
 * @returns 转换后秒数
 */
// export function dateTimeToSecond(time: string) {
//   const arr = time.split(":");
//   const hour = parseInt(arr[0]);
//   const min = parseInt(arr[1]);
//   const sec = parseInt(arr[2]);
//   return hour * 3600 + min * 60 + sec;
// }

/**
 * 时分秒字符串转为秒
 *
 * @param {string} time 时分秒字符串
 * @returns 转换后秒数
 */
export function dateTimeToSecond(time: string) {
  const parts = time.split(":").map(Number);
  if (parts.length > 3) {
    return 0;
  }

  if (parts.length === 3) {
    // 格式为 "HH:mm:ss"
    return dayjs
      .duration({
        hours: parts[0],
        minutes: parts[1],
        seconds: parts[2],
      })
      .asSeconds();
  }
  if (parts.length === 2) {
    // 格式为 "mm:ss"
    return dayjs
      .duration({
        minutes: parts[0],
        seconds: parts[1],
      })
      .asSeconds();
  }
  // 格式为 "ss"
  return parts[0];
}

export async function sleep(milliseconds: number = 1000) {
  return await new Promise((resolve) => setTimeout(resolve, milliseconds));
}
