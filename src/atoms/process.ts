import { atomWithImmer } from "jotai-immer";

import { shell } from "@/lib/tauri";

export const processesAtom = atomWithImmer(new Map<string, shell.Child>());
