import fs from "node:fs";
import path from "node:path";
import https from "node:https";
// pnpm add -D @actions/github
import { context, getOctokit } from "@actions/github";

// Note: 使用node下载ffmpeg, github action中不可见, 可能是缓存或者权限问题
const __dirname = path.resolve();
const args = process.argv.slice(2);
const target = args[0];
console.log("target:", target);

const octokit = getOctokit(process.env.GITHUB_TOKEN);

const targetMap = {
  "aarch64-apple-darwin": "ffmpeg-aarch64-apple-darwin",
  "x86_64-apple-darwin": "ffmpeg-x86_64-apple-darwin",
  "x86_64-pc-windows-msvc": "ffmpeg.exe",
};

function downloadFile(uri, dest) {
  console.log("downloadFile start", uri, dest);
  return new Promise((resolve, reject) => {
    // 确保dest路径存在
    const file = fs.createWriteStream(dest);

    https.get(uri, (res) => {
      if (res.statusCode >= 400) {
        reject(res.statusCode);
        return;
      }

      res.on("end", () => {
        console.log("download end");
      });

      // 进度、超时等
      file
        .on("finish", () => {
          console.log("finish write file");
          file.close(resolve);
        })
        .on("error", (err) => {
          fs.unlink(dest);
          reject(err.message);
        });

      res.pipe(file);
    });
  });
}

const download = async () => {
  const { data: release } = await octokit.rest.repos.getReleaseByTag({
    owner: context.repo.owner,
    repo: context.repo.repo,
    tag: "ffmpeg",
  });

  const fileName = targetMap[target];
  const asset = release.assets.find((a) => fileName && a.name === fileName);
  if (!asset) {
    throw new Error(`Asset not found for target ${target}`);
  }

  const dir = path.join(__dirname, "src-tauri", "bin");
  const dest =
    fileName === "ffmpeg.exe" ? path.join(dir, "windows", fileName) : path.join(dir, fileName);
  await downloadFile(asset.browser_download_url, dest);
};

download();
