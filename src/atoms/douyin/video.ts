import { atomWithInfiniteQuery } from "jotai-tanstack-query";

import { userAtom } from "@/atoms/douyin/user";
import { Source } from "@/config/constant";
import { getVideosByUid } from "@/service/douyin";
export type { Video, VideoResp } from "@/service/douyin";
// import { log } from "@/lib";

const pageSize = 20;

export const videoQueryAtom = atomWithInfiniteQuery((get) => ({
  queryKey: [Source.Douyin, get(userAtom).uid],
  queryFn: async ({ pageParam, queryKey: [_key, uid] }) => {
    // log.debug("videoQueryAtom queryFn:", uid, pageParam);
    return await getVideosByUid(uid, pageSize, pageParam);
  },
  getNextPageParam: (lastPage, _allPages) => {
    // log.debug("getNextPageParam:", lastPage);
    const { has_more = 1, max_cursor = 0 } = lastPage || {};
    if (has_more === 0) {
      return undefined;
    }
    return max_cursor;
  },
  initialPageParam: 0,
}));
