import { withImmer } from "jotai-immer";
import { atomWithStorage } from "jotai/utils";

import { storePrefix } from "@/config/constant";

export type SideBarConfig = {
  isOpen: boolean;
};

const storageKey = storePrefix + "sidebar";

export const defaultValue: SideBarConfig = { isOpen: true };

export const sidebarAtom = withImmer<SideBarConfig>(
  atomWithStorage<SideBarConfig>(storageKey, defaultValue),
);
