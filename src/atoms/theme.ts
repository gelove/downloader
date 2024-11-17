import { withImmer } from "jotai-immer";
import { atomWithStorage } from "jotai/utils";

import { storePrefix, Theme } from "@/config/constant";

const storageKey = storePrefix + "theme";

// const defaultValue = (Store.get(storageKey) as Theme) || Theme.System;
// export const themeAtom = atomWithImmer<Theme>(defaultValue);

export const defaultValue = Theme.System;
export const themeAtom = withImmer<Theme>(atomWithStorage<Theme>(storageKey, defaultValue));
