import { fs, path } from "@/lib/tauri";

/**
 * 获取文件的扩展名
 * @param {string} filename
 * @returns
 */
export function getExt(filename: string) {
  return filename.trim().split(".").pop()?.toLowerCase() ?? "";
}

export function replaceExt(filename: string, ext: string) {
  const list = filename.trim().split(".");
  list.pop();
  list.push(ext);
  return list.join(".");
}

// 添加文件名后缀 如: test.jpg -> test_1.jpg
export function addSuffix(filename: string, suffix: string = "_output") {
  const list = filename.trim().split(".");
  return list.slice(0, -1).join(".") + suffix + "." + list.pop();
}

export function getName(filename: string) {
  let name = filename.trim().split(path.sep()).pop() ?? "";
  let list = name.split(".");
  list.pop();
  return list.join(".");
}

export function getDir(filename: string) {
  const list = filename.trim().split(path.sep());
  list.pop();
  return list.length > 0 ? list.join(path.sep()) : "";
}

export async function writeFileInAppConfig(
  path: string,
  contents: string,
  options: fs.WriteFileOptions = {},
) {
  return await fs.writeTextFile(path, contents, {
    baseDir: fs.BaseDirectory.AppConfig,
    ...options,
  });
}

export async function createWithContent(path: string, content: string) {
  const file = await fs.create(path, { baseDir: fs.BaseDirectory.AppLocalData });
  file.write(new TextEncoder().encode(content));
  file.close();
}

/**
 * 判断文件夹是否存在，不存在则创建
 *
 * @param {string} path 文件夹路径
 */
export async function createDir(path: string) {
  const isExists = await fs.exists(path);
  if (!isExists) {
    // 创建转换视频默认的存放目录
    await fs.mkdir(path, {
      recursive: true,
    });
  }
}
