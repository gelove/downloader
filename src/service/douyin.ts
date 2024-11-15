import { Source } from "@/config/constant";
import { log } from "@/lib";
import { core } from "@/lib/tauri";
import { toast } from "@/components/ui";

export type User = {
  uid: string;
  avatar: string;
  nickname: string;
  source: Source;
  video_count: number;
};

export type Video = {
  id: string;
  url: string;
  title: string;
  desc: string;
  ratio: string;
  cover: string;
  is_top: number;
  likes: number;
  duration: number;
  total_count: number;
  create_time: number;
};

export type VideoResp = {
  list: Video[];
  has_more: number;
  max_cursor: number;
  error?: string;
};

export const getUser = async (uid: string): Promise<User | undefined> => {
  try {
    return await core.invoke<User>("get_user_by_ies", { uid });
  } catch (error) {
    log.error("getUser:", error);
    toast.error(`${error}`);
    return;
  }
};

export const getVideosByUid = async (
  uid: any,
  count: number,
  maxCursor: any = 0,
): Promise<VideoResp | undefined> => {
  log.debug("getVideosByUid", uid, maxCursor);
  try {
    if (!uid) {
      log.error("getVideosByUid: uid is empty");
      toast.error("uid is empty");
      return;
    }
    return await core.invoke<VideoResp>("get_videos_by_uid", { uid, count, maxCursor });
  } catch (error: any) {
    log.error("getVideosByUid:", typeof error, error);
    toast.error(`${error}`);
    return;
  }
};

export async function download(
  id: string,
  url: string,
  title: string,
  fileName: string,
  savePath: string,
) {
  return await core.invoke<string>("download", {
    id,
    url,
    title,
    fileName,
    savePath,
  });
}
