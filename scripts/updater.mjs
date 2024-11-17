import { readFile } from "node:fs/promises";
// pnpm add -D @actions/github
import { context, getOctokit } from "@actions/github";

const octokit = getOctokit(process.env.GITHUB_TOKEN);

// git tag -a updater -m "用于保存updater插件的更新文件"
// git push origin updater
// Create release from tag on https://github.com/gelove/downloader/releases/tag/updater
// https://github.com/gelove/downloader/releases/download/updater/latest.json
const updateRelease = async () => {
  // 获取 updater tag 的 release
  const { data: release } = await octokit.rest.repos.getReleaseByTag({
    owner: context.repo.owner,
    repo: context.repo.repo,
    tag: "updater",
  });

  // 删除旧的的文件
  const deletePromises = release.assets
    .filter((item) => item.name === "latest.json")
    .map(async (item) => {
      await octokit.rest.repos.deleteReleaseAsset({
        owner: context.repo.owner,
        repo: context.repo.repo,
        asset_id: item.id,
      });
    });

  await Promise.all(deletePromises);

  // 上传新的文件
  const file = await readFile("latest.json", { encoding: "utf-8" });

  await octokit.rest.repos.uploadReleaseAsset({
    owner: context.repo.owner,
    repo: context.repo.repo,
    release_id: release.id,
    name: "latest.json",
    data: file,
  });
};

updateRelease();
