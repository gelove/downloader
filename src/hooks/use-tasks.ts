import { useCallback } from "react";
import { useAtom, useSetAtom } from "jotai";

import { command, shell } from "@/lib/tauri";
import { log } from "@/lib";
import { Task, tasksAtom } from "@/atoms/task";
import { processesAtom } from "@/atoms/process";
import { AudioAction, VideoOrientation } from "@/config/constant";
import { noop } from "@/lib/utils";

export const useTasks = () => {
  const [tasks, setTasks] = useAtom(tasksAtom);
  const setProcesses = useSetAtom(processesAtom);

  const run = useCallback(
    async (tasks: Task[]) => {
      for (const task of tasks) {
        log.info(`[${task.action}]开始执行`);
        let child: shell.Child | undefined;
        switch (task.action) {
          case "audioFormat":
          case "videoFormat":
            let { format, quality, outputDir } = task.params;
            if (!format || !quality) {
              log.error("格式或质量不能为空");
              return;
            }
            child = await command.transcode(task.id, task.data, format, quality, outputDir);
            break;
          case VideoOrientation.Portrait:
          case VideoOrientation.Landscape:
            child = await command.videoChangeOrientation(
              task.id,
              task.data,
              task.action as VideoOrientation,
            );
            break;
          case AudioAction.Merge:
            const { audioFile } = task.params;
            if (!audioFile) {
              log.error("音频文件不能为空");
              return;
            }
            child = await command.mergeAudio(task.id, task.data, audioFile);
            break;
          case AudioAction.Split:
            child = await command.splitVideoAndAudio(task.id, task.data);
            break;
          default:
            break;
        }
        log.info(`[${task.action}]创建子进程成功, child => ${JSON.stringify(child)}`);
        if (!child) {
          log.error(`[${task.action}]未创建对应命令, child => ${child} `);
          return;
        }
        setProcesses((draft) => {
          draft[task.id] = child;
        });
      }
    },
    [setProcesses],
  );

  const add = useCallback(
    (tasks: Task[]) => {
      setTasks((draft) => {
        draft.unshift(...tasks);
      });
      run(tasks);
    },
    [run, setTasks],
  );

  // 删除对应索引数据
  const remove = useCallback(
    (id: string) => {
      log.info("task remove id =>", id);
      setTasks((draft) => {
        const index = draft.findIndex((task) => task.id === id);
        if (index >= 0 && index < draft.length) {
          draft.splice(index, 1);
        }
      });
      // 删除对应任务进程对象
      setProcesses((draft) => {
        draft[id]?.kill().then(noop);
        delete draft[id];
      });
    },
    [setProcesses, setTasks],
  );

  // 关闭所有任务进程
  const clear = useCallback(() => {
    log.info("关闭所有任务进程");
    setTasks((draft) => {
      draft.length = 0;
    });
    setProcesses((draft) => {
      Object.keys(draft).forEach((key) => {
        log.info(`清空所有子进程, child => ${JSON.stringify(draft[key])}`);
        draft[key]?.kill().then(noop);
        delete draft[key];
      });
    });
  }, [setProcesses, setTasks]);

  const update = useCallback(
    (id: string, task: Task) => {
      setTasks((draft) => {
        const index = draft.findIndex((t) => t.id === id);
        if (index >= 0) {
          draft[index] = task;
        }
      });
    },
    [setTasks],
  );

  return { tasks, add, clear, remove, update, setTasks };
};
