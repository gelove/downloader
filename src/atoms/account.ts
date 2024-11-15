import { withImmer } from "jotai-immer";
import { atomWithStorage } from "jotai/utils";

import { storePrefix } from "@/config/constant";

export type Account = {
  avatarUrl: string;
  name: string;
  email: string;
};

const storageKey = storePrefix + "account";
const defaultValue: Account = { avatarUrl: "/avatar.jpg", name: "Allen", email: "geloves@gmail.com" };

export const accountAtom = withImmer<Account>(atomWithStorage<Account>(storageKey, defaultValue));
