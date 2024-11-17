import { event } from "@/lib/tauri";
import { formatTime } from "@/lib/time";

export function debug(...value: any[]) {
  if (import.meta.env.TAURI_ENV_DEBUG === "true") {
    console.debug(`[${formatTime()}]`, ...value);
  }
  event.emit("debug", value);
}

export function info(...value: any[]) {
  if (import.meta.env.TAURI_ENV_DEBUG === "true") {
    console.info(`[${formatTime()}]`, ...value);
  }
  event.emit("info", value);
}

export function warn(...value: any[]) {
  if (import.meta.env.TAURI_ENV_DEBUG === "true") {
    console.warn(`[${formatTime()}]`, ...value);
  }
  event.emit("warn", value);
}

export function error(...value: any[]) {
  if (import.meta.env.TAURI_ENV_DEBUG === "true") {
    console.error(`[${formatTime()}]`, ...value);
  }
  event.emit("error", value);
}
