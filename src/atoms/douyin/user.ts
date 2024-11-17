import { withImmer } from "jotai-immer";
import { atomWithStorage } from "jotai/utils";

import { Source, storePrefix } from "@/config/constant";
import { User } from "@/service/douyin";

// const queryKey = Source.douyin + "-user";
const userKey = storePrefix + Source.Douyin + "-user";
const usersKey = storePrefix + Source.Douyin + "-users";

const defaultUser: User = {
  uid: "",
  avatar: "",
  nickname: "",
  source: Source.Douyin,
  video_count: 0,
};

// uid: "MS4wLjABAAAAf6Lm-c6eQYIPhWnQaalomsoP5uB-J2gAxg0SLLJnSZw",
export const userAtom = withImmer<User>(atomWithStorage<User>(userKey, defaultUser));

export const usersAtom = withImmer<User[]>(atomWithStorage<User[]>(usersKey, []));
