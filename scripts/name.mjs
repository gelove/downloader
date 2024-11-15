// 执行 deno --allow-all scripts/name.ts
// 嵌入外部二进制文件需要根据平台和架构修改二进制文件名
// import fs from "node:fs";
import { execSync } from "node:child_process";

const ext = process.platform === "win32" ? ".exe" : "";

const rustInfo = execSync("rustc -vV");
const targetTriple = /host: (\S+)/g.exec(rustInfo.toString())?.[1];
if (!targetTriple) {
  console.error("Failed to determine platform target triple");
}
// 输出 targetTriple: app-aarch64-apple-darwin
console.log(`targetTriple: app-${targetTriple}${ext}`);
// fs.renameSync(`app${ext}`, `../src-tauri/bin/app-${targetTriple}${ext}`);
