import { useEffect, useCallback } from "react";
import { useAtom } from "jotai";

import { command, shell } from "@/lib/tauri";
import { log } from "@/lib";
import { Task, tasksAtom } from "@/atoms/task";
import { processesAtom } from "@/atoms/process";
import { AudioAction, VideoOrientation } from "@/config/constant";

export const useTasks = () => {
  const [tasks, setTasks] = useAtom(tasksAtom);
  const [processes, setProcesses] = useAtom(processesAtom);

  useEffect(() => {
    log.info("useTasks 加载完成", processes.keys());
    return () => {
      log.info("useTasks 卸载");
    };
  }, []);

  const run = useCallback(
    async (tasks: Task[]) => {
      for (const task of tasks) {
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
        if (!child) return;
        setProcesses((draft) => {
          draft.set(task.id, child);
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
    async (id: string) => {
      log.debug("task remove id =>", id);
      setTasks((draft) => {
        const index = draft.findIndex((task) => task.id === id);
        if (index >= 0 && index < draft.length) {
          draft.splice(index, 1);
        }
      });
      const child = processes.get(id);
      log.debug("task remove child =>", child);
      if (!child) return;
      // 如果已经在转换中，则关闭进程
      await child.kill();
      // 删除对应任务进程对象
      setProcesses((draft) => {
        draft.delete(id);
      });
    },
    [setTasks, setProcesses],
  );

  // 关闭所有任务进程
  const clear = useCallback(async () => {
    log.info("关闭所有任务进程");
    setTasks((draft) => {
      draft.length = 0;
    });
    for (const child of processes.values()) {
      await child.kill();
    }
    setProcesses((draft) => {
      draft.clear();
    });
  }, [setTasks, setProcesses]);

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
