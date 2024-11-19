import { atomWithImmer } from "jotai-immer";

import { shell } from "@/lib/tauri";

type ProcessMap = Record<string, shell.Child>;

export const processesAtom = atomWithImmer<ProcessMap>({});
