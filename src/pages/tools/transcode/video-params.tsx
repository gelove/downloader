import { useCallback, useEffect, useRef, useState } from "react";

import {
  audioFormatList,
  VideoFormat,
  videoParams,
  original,
  AudioAction,
  VideoOrientation,
  TaskAction,
} from "@/config/constant";
import { Label } from "@/components/ui/label";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createTask, MediaData } from "@/atoms/task";
import { dialog, path } from "@/lib/tauri";
import { useTasks } from "@/hooks/use-tasks";
import { toast } from "@/components/ui";
import { log } from "@/lib";

export type Props = {
  title: string;
  all?: boolean;
  data?: MediaData;
  list?: MediaData[];
};

export type Tab = "videoFormat" | "orientation" | "audio";

function getOptions() {
  return Object.keys(videoParams).map((item) => ({ name: item, value: item }));
}

function getDefaultFormat(data?: MediaData) {
  return data ? data.extension : "mp4";
}

function getDefaultQuality(data?: MediaData) {
  return data ? data.resolution : original;
}

function getDefaultAvailableQualities(data?: MediaData) {
  return videoParams[data ? (data.extension as VideoFormat) : "mp4"];
}

export function VideoParams({ title, data, list, all = false }: Props) {
  const options = useRef(getOptions());
  const [tab, setTab] = useState<Tab>("videoFormat");
  const [format, setFormat] = useState(getDefaultFormat(data));
  const [quality, setQuality] = useState(getDefaultQuality(data));
  const [availableQualities, setAvailableQualities] = useState(getDefaultAvailableQualities(data));
  const [orientation, setOrientation] = useState(VideoOrientation.Portrait);
  const [audioAction, setAudioAction] = useState(AudioAction.Split);
  const [audioFile, setAudioFile] = useState("");
  const [action, setAction] = useState<TaskAction>();
  const { add } = useTasks();

  useEffect(() => {
    const getAvailableQualities = () => {
      return videoParams[format as VideoFormat] || [];
    };
    const availableQualities = getAvailableQualities();
    setAvailableQualities(availableQualities);
    setQuality(availableQualities[0].value);
  }, [format]);

  useEffect(() => {
    switch (tab) {
      case "videoFormat":
        setAction("videoFormat");
        break;
      case "orientation":
        setAction(orientation);
        break;
      case "audio":
        setAction(audioAction);
        break;
      default:
        break;
    }
  }, [tab, audioAction, orientation]);

  const handleChangeTab = useCallback((value: string) => {
    setTab(value as Tab);
  }, []);

  const handleFormatChange = useCallback((value: string) => {
    setFormat(value as VideoFormat);
  }, []);

  const handelVideoOrientationChange = useCallback((value: string) => {
    setOrientation(value as VideoOrientation);
  }, []);

  const handelAudioActionChange = useCallback((value: string) => {
    const val = value as AudioAction;
    if (val !== AudioAction.Merge) {
      setAudioFile("");
    }
    setAudioAction(val);
  }, []);

  const handelSelectAudioFile = useCallback(async () => {
    const selected = await dialog.open({
      filters: [
        {
          name: "选择音频文件",
          extensions: audioFormatList,
        },
      ],
      defaultPath: await path.downloadDir(),
    });
    // log.debug("selected =>", selected);
    if (!selected) {
      return;
    }
    setAudioFile(selected);
  }, []);

  const handleCreate = useCallback(
    async (data: MediaData) => {
      if (!data || !action) {
        log.error(`handleCreate 数据错误: action => ${action}, data => ${data}`);
        return;
      }
      let params = {};
      switch (action) {
        case "videoFormat":
          if (!format || !quality) {
            toast.error("请选择转码格式和分辨率");
            return;
          }
          params = { format, quality };
          break;
        case VideoOrientation.Portrait:
        case VideoOrientation.Landscape:
          params = { orientation };
          break;
        case AudioAction.Merge:
          if (!audioFile) {
            toast.error("请选择需合并的音频文件");
            return;
          }
          params = { audioFile };
          break;
        default:
          break;
      }
      return createTask(action, data, params);
    },
    [action, format, quality, audioFile, orientation],
  );

  const handleStart = useCallback(
    async (_: React.MouseEvent<HTMLElement>) => {
      if (data) {
        const task = await handleCreate(data);
        if (!task) {
          toast.error("创建任务失败");
          return;
        }
        add([task]);
        return;
      }
      if (!list) {
        return;
      }
      // 全部执行
      let tasks = [];
      for (const item of list) {
        const task = await handleCreate(item);
        if (!task) continue;
        tasks.push(task);
      }
      add(tasks);
    },
    [data, list, handleCreate, add],
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
        <Tabs className="w-full" value={tab} onValueChange={handleChangeTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="videoFormat">转码</TabsTrigger>
            <TabsTrigger value="orientation">方向</TabsTrigger>
            <TabsTrigger value="audio">音频</TabsTrigger>
          </TabsList>
          <TabsContent value="videoFormat">
            <div className="grid gap-4 py-4">
              <fieldset className="flex items-center gap-4">
                <Label htmlFor="format" className="w-16 text-right">
                  格式:
                </Label>
                <Select value={format} onValueChange={handleFormatChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="选择格式" />
                  </SelectTrigger>
                  <SelectContent id="format">
                    {options.current.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </fieldset>
              <fieldset className="flex items-center gap-4">
                <Label htmlFor="quality" className="w-16 text-right">
                  分辨率:
                </Label>
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="选择分辨率" />
                  </SelectTrigger>
                  <SelectContent id="quality">
                    {availableQualities.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </fieldset>
            </div>
          </TabsContent>
          <TabsContent value="orientation">
            <div className="grid gap-4 py-4">
              <RadioGroup value={orientation} onValueChange={handelVideoOrientationChange}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={VideoOrientation.Portrait} id="portrait" />
                  <Label htmlFor="portrait">横屏转竖屏</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={VideoOrientation.Landscape} id="landscape" />
                  <Label htmlFor="landscape">竖屏转横屏</Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>
          <TabsContent value="audio">
            <div className="grid gap-4 py-4">
              <RadioGroup value={audioAction} onValueChange={handelAudioActionChange}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={AudioAction.Split} id="split-audio" />
                  <Label htmlFor="split-audio">提取音频与视频</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={AudioAction.Merge} id="merge-audio" />
                  <Label htmlFor="merge-audio">合并音频</Label>
                </div>
              </RadioGroup>
              {audioFile && <span>{audioFile}</span>}
              {audioAction === AudioAction.Merge && (
                <div className="flex items-center gap-4">
                  <Button
                    className="w-full bg-teal-500 hover:bg-teal-600"
                    onClick={handelSelectAudioFile}>
                    选择音频文件
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        <DialogClose asChild>
          <Button onClick={handleStart} className="w-full bg-teal-500 hover:bg-teal-600">
            执行
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
