import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useImmer } from "use-immer";
import { useVirtualizer } from "@tanstack/react-virtual";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button, toast } from "@/components/ui";
import { command, event, shell, updater } from "@/lib/tauri";
import { file, log } from "@/lib";
import { TaskStatus } from "@/atoms/task";
import { CmdStatus, ProgressResult } from "@/lib/tauri/command";
import { useTasks } from "@/hooks/use-tasks";
import { Trash2 } from "@/components/common/icons";

export type Props = {};

export default function Dashboard({}: Props) {
  const navigate = useNavigate();
  const parentRef = useRef<HTMLDivElement>(null);
  const [contentLength, setContentLength] = useState<number>();
  // const [chunkLength, setChunkLength] = useState<number>();
  const [updateProgress, setUpdateProgress] = useState(0);
  const [progress, setProgress] = useImmer<Map<string, number>>(new Map());
  const { tasks, clear, remove, setTasks } = useTasks();

  useEffect(() => {
    log.info("Dashboard 组件加载完成");
    return () => {
      log.info("Dashboard 组件卸载");
    };
  }, []);

  const handleRemove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const { id } = e.currentTarget.dataset;
      log.debug("handleRemove", id);
      if (!id) {
        log.error(`handleRemove id is empty, id=${id}`);
        return;
      }
      remove(id);
      setProgress((draft) => {
        draft.delete(id);
      });
    },
    [remove, setProgress],
  );

  const handleOpen = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    const { path } = e.currentTarget.dataset;
    if (!path) {
      log.error(`handleOpen path is empty, path=${path}`);
      return;
    }
    await command.openWith(path);
  }, []);

  const handleOpenDir = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    const { path } = e.currentTarget.dataset;
    if (!path) {
      log.error(`handleOpenDir path is empty, path=${path}`);
      return;
    }
    const dir = file.getDir(path);
    if (!dir) {
      log.error(`handleOpenDir dir is empty, dir=${dir}`);
      return;
    }
    await shell.open(dir);
  }, []);

  const handleClear = useCallback(() => {
    clear();
    setProgress((draft) => {
      draft.clear();
    });
  }, []);

  const handleListen = useCallback(
    (result: ProgressResult) => {
      const { id, status, progress, value, error } = result;
      switch (status) {
        case CmdStatus.Progress:
          if (!id) {
            log.error(`handleListen Progress 参数错误, id=${id}, progress=${progress}`);
            return;
          }
          if (!progress) return;
          setProgress((draft) => {
            draft.set(id, progress);
          });
          setTasks((draft) => {
            const index = draft.findIndex((t) => t.id === id);
            if (index < 0 || index >= draft.length) return;
            if (draft[index].status !== TaskStatus.Progress) {
              draft[index].status = TaskStatus.Progress;
            }
          });
          break;
        case CmdStatus.Finished:
          if (!id || !progress) {
            log.error(`handleListen Finished 参数错误, id=${id}, progress=${progress}`);
            return;
          }
          setProgress((draft) => {
            draft.set(id, progress);
          });
          setTasks((draft) => {
            const index = draft.findIndex((t) => t.id === id);
            if (index >= 0 && index < draft.length) {
              draft[index].status = TaskStatus.Finished;
              draft[index].result = value || "";
            }
          });
          break;
        case CmdStatus.Closed:
          if (!id) {
            log.error(`handleListen Closed 参数错误, id=${id}`);
            return;
          }
          log.info("cmd closed", id);
          break;
        case CmdStatus.Error:
          if (!id) {
            log.error(`handleListen Error 参数错误, id=${id}`);
            return;
          }
          setTasks((draft) => {
            const index = draft.findIndex((t) => t.id === id);
            if (index >= 0 && index < draft.length) {
              draft[index].status = TaskStatus.Error;
            }
          });
          toast.error(error || "handleListen 未知错误");
          break;
      }
    },
    [tasks, setTasks],
  );

  useEffect(() => {
    const clean1 = event.listen<ProgressResult>("transcode", async (e) => {
      handleListen(e.payload);
    });
    const clean2 = event.listen<ProgressResult>("videoChangeOrientation", async (e) => {
      handleListen(e.payload);
    });
    const clean3 = event.listen<ProgressResult>("splitVideoAndAudio", async (e) => {
      handleListen(e.payload);
    });
    const clean4 = event.listen<ProgressResult>("mergeAudio", async (e) => {
      handleListen(e.payload);
    });

    return () => {
      clean1.then((fn) => fn());
      clean2.then((fn) => fn());
      clean3.then((fn) => fn());
      clean4.then((fn) => fn());
    };
  }, [handleListen]);

  useEffect(() => {
    const gotoListener = event.listen("goto", async (e) => {
      const route = e.payload as string;
      log.debug("goto", route);
      navigate(route);
    });

    const updateListener = event.listen("update", async (_) => {
      const update = await updater.check();
      if (!update?.available) {
        toast.success("Currently on the Latest Version");
        return;
      }
      update.downloadAndInstall((e) => {
        // 打开下载进度条
        log.debug("update", e);
        if (e.event === "Started") {
          log.debug("update Started contentLength =>", e.data.contentLength);
          setContentLength(e.data.contentLength);
          setUpdateProgress(0);
          return;
        }
        if (e.event === "Progress") {
          log.debug("update progress chunkLength =>", e.data.chunkLength);
          // setChunkLength(e.data.chunkLength);
          if (contentLength) {
            setUpdateProgress((e.data.chunkLength / contentLength) * 100);
          }
          return;
        }
        if (e.event === "Finished") {
          log.debug("update Finished");
          setUpdateProgress(100);
        }
      });
    });

    return () => {
      log.debug("app unmounted");
      gotoListener.then((fn) => fn());
      updateListener.then((fn) => fn());
      // focusChange.current && focusChange.current();
    };
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5,
  });

  return (
    <div className="p-2">
      <div ref={parentRef} className="h-[640px] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[500px]">文件</TableHead>
              <TableHead>任务类型</TableHead>
              <TableHead className="w-[160px]">状态</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const task = tasks[virtualRow.index];
              return (
                <TableRow key={task.id} data-id={task.id}>
                  <TableCell className="w-[500px] break-all">{task.data.filepath}</TableCell>
                  <TableCell>{task.action}</TableCell>
                  <TableCell className="w-[160px]">
                    {task.status === TaskStatus.Progress ? (
                      <Progress value={progress.get(task.id) || 0} className="w-full" />
                    ) : (
                      <Badge
                        variant={
                          task.status === TaskStatus.Finished
                            ? "default"
                            : task.status === TaskStatus.Pending
                              ? "outline"
                              : task.status === TaskStatus.Error
                                ? "destructive"
                                : "secondary"
                        }>
                        {task.status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="flex w-[200px] items-center justify-start gap-1">
                    <Button
                      size="sm"
                      data-id={task.id}
                      onClick={handleRemove}
                      variant="destructive">
                      删除
                    </Button>
                    {task.result && (
                      <Button
                        size="sm"
                        data-path={task.result}
                        onClick={handleOpen}
                        variant="secondary">
                        打开
                      </Button>
                    )}
                    {task.result && (
                      <Button
                        size="sm"
                        className="bg-teal-500 hover:bg-teal-600"
                        data-path={task.result}
                        onClick={handleOpenDir}
                        variant="secondary">
                        目录
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {updateProgress > 0 && <div>Downloading Update {updateProgress}%</div>}
      </div>
      <div className="mb-4 flex items-center justify-end">
        <Button onClick={handleClear} variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" /> 清空任务
        </Button>
      </div>
    </div>
  );
}
