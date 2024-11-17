import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { useAtom } from "jotai";

import { Check, ChevronsUpDown } from "@/components/common/icons";
import { cn } from "@/lib/utils";
import { toast, Button } from "@/components/ui";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usersAtom, userAtom } from "@/atoms/douyin/user";
import { getUser } from "@/service/douyin";
import { log } from "@/lib";

export type Option = {
  label: string;
  value: string;
  [key: string]: string;
};

type ComboboxFormProps = {
  placeholder?: string;
  emptyMessage?: string;
};

export function ComboboxForm({
  placeholder = "Search",
  emptyMessage = "No results",
}: ComboboxFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const emptyRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  // const [user, setUser] = useState<User>({
  //   uid: "",
  //   avatar: "",
  //   nickname: "",
  //   source: Source.Douyin,
  //   video_count: 0,
  // });
  const [user, setUser] = useAtom(userAtom);
  const [users, setUsers] = useAtom(usersAtom);

  useEffect(() => {
    // log.debug("users =>", users);
    setOptions(users.map((user) => ({ value: user.uid, label: user.nickname })));
  }, [users]);

  const handleSelectOption = useCallback(
    (option: Option) => {
      log.debug("option =>", option);
      const selected = users.find((v) => v.uid === option.value);
      if (selected) {
        setUser(selected);
        setOpen(false);
        clearInput();
      }
    },
    [users],
  );

  // const handleInputChange = useCallback(
  //   (value: string) => {
  //     !loading && setInputValue(value);
  //   },
  //   [loading],
  // );

  const formatInput = useCallback((value: string) => {
    if (value.includes("www.douyin.com/user")) {
      // const uidRegex = /(?:.*)douyin.com\/user\/?([-\w]+)(?:.*)/;
      const uidRegex = /(?:.*)douyin.com\/user\/?([-\w]+)/;
      const match = value.match(uidRegex);
      return match ? match[1] : "";
    }
    return value;
  }, []);

  const handleAddUser = useCallback((uid: string) => {
    setLoading(true);
    uid = uid.trim();
    log.debug("uid =>", uid);
    if (!uid) {
      toast.error("用户 uid 不能为空");
      setLoading(false);
      return;
    }
    getUser(uid)
      .then((user) => {
        if (!user) {
          toast.error("获取用户信息失败");
          return;
        }
        setUser(user);
        setUsers((draft) => {
          draft.unshift(user);
        });
        setOpen(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (!input) {
        return;
      }

      // 判断备选项是否为空, 判断 emptyRef 是否存在, emptyRef为空则备选项不为空
      if (event.key === "Enter" && input.value !== "" && emptyRef?.current) {
        // event.preventDefault(); // 不要阻止默认行为 (select 选项)
        // const val = formatInput?.(input.value.trim()) || input.value.trim();
        const val = formatInput(input.value.trim()) || input.value.trim();
        const option = options.find((v) => v.label === val || v.value === val);
        log.debug("Enter input", val, option);
        if (option) {
          // setSelected(option);
          handleSelectOption(option);
          return;
        }
        // 不存在且备选项为空则添加新选项
        log.debug("Add new option", val);
        handleAddUser(val);
      }
    },
    [options, handleSelectOption, formatInput],
  );

  const handleRemoveUser = useCallback((uid: string) => {
    setUsers((draft) => {
      const index = draft.findIndex((u) => u.uid === uid);
      index >= 0 && draft.splice(index, 1);
    });
  }, []);

  // const handleChangeOpen = useCallback((val: boolean) => {
  //   setOpen(val);
  //   !val && clearInput();
  // }, []);

  const clearInput = useCallback(() => {
    // 延迟清空输入框 避免下拉框关闭时闪烁
    setTimeout(() => {
      setInputValue("");
    }, 100);
  }, []);

  // NOTE: MacOS环境下, 中文输入法会导致点击按钮关闭时需要轻点两次触摸板

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn("w-[420px] justify-between", !user.uid && "text-muted-foreground")}>
          {user.nickname || "选择用户"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0" onBlur={clearInput}>
        <Command>
          <CommandInput
            ref={inputRef}
            placeholder={placeholder}
            disabled={loading}
            value={inputValue}
            onValueChange={setInputValue}
            onKeyDown={handleKeyDown}
            // onBlur={clearInput}
          />
          <CommandList>
            <CommandEmpty ref={emptyRef}>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((v) => {
                const isSelected = user.uid === v.value;
                return (
                  <Item
                    key={v.value}
                    option={v}
                    isSelected={isSelected}
                    onSelect={handleSelectOption}
                    onRemove={handleRemoveUser}
                  />
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

type ItemProps = {
  option: Option;
  isSelected: boolean;
  onSelect: (option: Option) => void;
  onRemove?: (value: string) => void;
};

const Item = ({ option, isSelected, onSelect, onRemove }: ItemProps) => {
  // NOTE: MacOS环境下, 中文输入法会导致选中时需要轻点两次触摸板
  const handleSelect = useCallback(
    (_: string) => {
      onSelect(option);
    },
    [onSelect, option],
  );

  const handleRemove = useCallback(
    (event: MouseEvent<Element>) => {
      // event.preventDefault();
      event.stopPropagation();
      onRemove?.(option.value);
    },
    [onRemove, option.value],
  );

  return (
    <CommandItem
      value={option.label}
      onSelect={handleSelect}
      className={cn("flex w-full items-center gap-2", !isSelected && "pl-8")}>
      {isSelected && <Check className="w-4" />}
      {option.label}
      {onRemove && (
        <CommandShortcut>
          <Button variant="ghost" size="sm" onClick={handleRemove}>
            删除
          </Button>
          {/* <Close className="mr-2 h-4 w-4" onClick={handleRemove} /> */}
        </CommandShortcut>
      )}
    </CommandItem>
  );
};
