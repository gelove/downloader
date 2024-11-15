async function getLastGitHubRelease(owner, repo) {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/vnd.github.v3+json", // 指定API版本
        // Authorization: `Bearer ${accessToken}`, // 如果需要授权，则填入有效的GitHub个人访问令牌
      },
    });
    if (!response.ok) {
      throw new Error(`Error fetching release info: ${response.status}`);
    }
    const releaseData = await response.json();
    return releaseData;
  } catch (error) {
    console.error("Error fetching the latest release:", error);
    return null;
  }
}

let urls = [
  "https://github.com/gelove/downloader/releases/download/v1.0.0/Downloader_1.0.0_aarch64.dmg",
  "https://mirror.ghproxy.com/https://github.com/gelove/downloader/releases/download/v1.0.0/Downloader_1.0.0_aarch64.dmg",
  "https://github.com/gelove/downloader/releases/download/v1.0.0/Downloader_1.0.0_x64.dmg",
  "https://mirror.ghproxy.com/https://github.com/gelove/downloader/releases/download/v1.0.0/Downloader_1.0.0_x64.dmg",
  "https://github.com/gelove/downloader/releases/download/v1.0.0/Downloader_1.0.0_x64-setup.exe",
  "https://mirror.ghproxy.com/https://github.com/gelove/downloader/releases/download/v1.0.0/Downloader_1.0.0_x64-setup.exe",
];

const getReleaseInfo = async () => {
  const res = await getLastGitHubRelease("gelove", "downloader");
  const originAppleDmg = res.assets.filter((item) => item.name.endsWith("aarch64.dmg"))[0]
    .browser_download_url;
  const originIntelDmg = res.assets.filter((item) => item.name.endsWith("x64.dmg"))[0]
    .browser_download_url;
  const originExe = res.assets.filter((item) => item.name.endsWith(".exe"))[0].browser_download_url;
  urls = [
    originAppleDmg,
    `https://mirror.ghproxy.com/${originAppleDmg}`,
    originIntelDmg,
    `https://mirror.ghproxy.com/${originIntelDmg}`,
    originExe,
    `https://mirror.ghproxy.com/${originExe}`,
  ];
};

getReleaseInfo();

const onClick = (id) => {
  console.log(urls);
  const url = urls[id];
  const a = document.createElement("a");
  const filename = url.split("/").pop();
  a.href = url;
  a.download = filename;
  a.click();
};
