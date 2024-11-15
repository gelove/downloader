import { withImmer } from "jotai-immer";
import { atomWithStorage } from "jotai/utils";

import { Media, storePrefix, TaskAction, VideoOrientation } from "@/config/constant";
import { uuid } from "@/lib/utils";

export enum TaskStatus {
  Pending = "Pending", // 待执行
  Progress = "Progress", // 执行中
  Finished = "Finished", // 已完成
  Error = "Error", // 出错
}

// export type TaskStatusType = `${TaskStatus}`;

export type MediaData = {
  id: string;
  kind: Media;
  filepath: string;
  filename: string;
  extension: string;
  size: string;
  time: string;
  width: number;
  height: number;
  duration: number;
  bitRate: string;
  resolution: string;
};

export type Params = {
  format?: string;
  quality?: string;
  audioFile?: string;
  orientation?: VideoOrientation;
  outputDir?: string;
};

export type Task = {
  id: string;
  action: TaskAction;
  data: MediaData;
  params: Params;
  status: TaskStatus;
  result: string;
};

export function createTask(action: TaskAction, data: MediaData, params: Params): Task {
  return {
    id: uuid(),
    action,
    data,
    params,
    status: TaskStatus.Pending,
    result: "",
  };
}

const storageKey = storePrefix + "tasks";

export const tasksAtom = withImmer<Task[]>(atomWithStorage<Task[]>(storageKey, []));
