import { useCallback, useEffect, useRef, useState } from "react";

import { AudioFormat, audioParams } from "@/config/constant";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTask, MediaData } from "@/atoms/task";
import { useTasks } from "@/hooks/use-tasks";

export type Props = {
  title: string;
  all?: boolean;
  data?: MediaData;
  list?: MediaData[];
};

function getOptions() {
  return Object.keys(audioParams).map((item) => ({ name: item, value: item }));
}

function getDefaultFormat(data?: MediaData) {
  return data ? data.extension : "mp3";
}

function getDefaultQuality(data?: MediaData) {
  return data ? data.bitRate : audioParams["mp3"][0].value;
}

function getDefaultAvailableQualities(data?: MediaData) {
  return audioParams[data ? (data.extension as AudioFormat) : "mp3"];
}

export function AudioParams({ title, data, list, all = false }: Props) {
  const options = useRef(getOptions());
  const [format, setFormat] = useState(getDefaultFormat(data));
  const [quality, setQuality] = useState(getDefaultQuality(data));
  const [availableQualities, setAvailableQualities] = useState(getDefaultAvailableQualities(data));
  const { add } = useTasks();

  useEffect(() => {
    const getAvailableQualities = () => {
      return audioParams[format as AudioFormat] || [];
    };
    const availableQualities = getAvailableQualities();
    setAvailableQualities(availableQualities);
    setQuality(availableQualities[0].value);
  }, [format]);

  const handleFormatChange = useCallback((value: string) => {
    setFormat(value as AudioFormat);
  }, []);

  const handleStart = useCallback(
    async (_: React.MouseEvent<HTMLElement>) => {
      if (data) {
        const task = createTask("audioFormat", data, { format, quality });
        add([task]);
        return;
      }
      if (!list) {
        return;
      }
      // 全部执行
      let tasks = [];
      for (const item of list) {
        const task = createTask("audioFormat", item, { format, quality });
        tasks.push(task);
      }
      add(tasks);
    },
    [data, list, format, quality],
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          disabled={all && (!list || list.length === 0)}
          className="bg-teal-500 hover:bg-teal-600">
          {title}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-96" aria-describedby={"设置转换参数"}>
        <DialogHeader>
          <DialogTitle>设置转换参数</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <fieldset className="flex items-center gap-4">
            <label htmlFor="format" className="w-16 text-right">
              格式:
            </label>
            <Select value={format} onValueChange={handleFormatChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="选择格式" />
              </SelectTrigger>
              <SelectContent>
                {options.current.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </fieldset>
          <fieldset className="flex items-center gap-4">
            <label htmlFor="quality" className="w-16 text-right">
              比特率:
            </label>
            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="选择比特率" />
              </SelectTrigger>
              <SelectContent>
                {availableQualities.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </fieldset>
        </div>
        <DialogClose asChild>
          <Button onClick={handleStart} className="w-full bg-teal-500 hover:bg-teal-600">
            执行
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
