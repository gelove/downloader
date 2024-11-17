import { useState, useRef, useCallback, type KeyboardEvent, type MouseEvent } from "react";
import { Command } from "cmdk";

import { Skeleton } from "@/components/ui/skeleton";
import {
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
  CommandShortcut,
} from "@/components/ui/command";
import { Check, Close, CircleX } from "@/components/common/icons";
import { cn } from "@/lib/utils";
import { log } from "@/lib";

// export type Option = Record<"label" | "value", string> & Record<string, string>;
// export type Option = { label: string; value: string } & Record<string, string>;
export type Option = {
  label: string;
  value: string;
  [key: string]: string;
};

type AutoCompleteProps = {
  inputValue: string;
  setInputValue: (value: string) => void;
  list: Option[];
  selected?: Option;
  selectOption: (value: Option) => void;
  addOption?: (value: string) => void;
  removeOption?: (value: string) => void;
  formatInput?: (value: string) => string;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  emptyMessage?: string;
};

export const AutoComplete = ({
  inputValue,
  setInputValue,
  list,
  selected,
  selectOption,
  addOption,
  removeOption,
  formatInput,
  disabled = false,
  isLoading = false,
  placeholder = "Search",
  emptyMessage = "No results",
}: AutoCompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const emptyRef = useRef<HTMLDivElement>(null);
  const [isOpen, setOpen] = useState(false);

  const handleSelectOption = useCallback(
    (v: Option) => {
      // setInputValue(v.label);
      // setSelected(v);
      selectOption(v);
      // hack: in the next tick
      // 防止用户选择选项后输入框继续获得聚焦
      setTimeout(() => {
        inputRef?.current?.blur();
      }, 0);
    },
    [selectOption],
  );

  const handleBlur = useCallback(() => {
    setOpen(false);
    // setInputValue(selected?.label);
  }, []);

  const handleFocus = useCallback(() => {
    setOpen(true);
  }, []);

  const handleInputChange = useCallback(
    (value: string) => {
      !isLoading && setInputValue(value);
    },
    [isLoading],
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (!input) {
        return;
      }

      // 用户输入时保持显示下拉选项
      if (!isOpen) {
        setOpen(true);
      }

      // input 非默认行为
      if (event.key === "Enter" && input.value !== "") {
        const val = formatInput?.(input.value.trim()) || input.value.trim();
        const option = list.find((v) => v.label === val || v.value === val);
        log.debug("Enter input", val, option);
        if (option) {
          // setSelected(option);
          selectOption(option);
          return;
        }
        // 判断备选项是否为空
        // 判断 emptyRef 是否存在, emptyRef为空则备选项不为空
        if (!emptyRef?.current) {
          return;
        }
        // 不存在且备选项为空则添加新选项
        log.debug("Add new option", val);
        addOption?.(val);
      }

      if (event.key === "Escape") {
        event.preventDefault();
        input.blur();
      }
    },
    [isOpen, list, selectOption, addOption, formatInput],
  );

  return (
    <Command>
      <div className="relative w-full">
        <CommandInput
          ref={inputRef}
          value={inputValue}
          onValueChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className="text-base"
        />
        {inputValue && (
          <CircleX className="absolute bottom-2 right-2 z-10 mr-2 h-5 w-5" onClick={handleClear} />
        )}
      </div>
      <div className="relative mt-1 w-full">
        <div
          className={cn(
            "absolute top-0 z-10 w-full rounded-xl bg-white outline-none animate-in fade-in-0 zoom-in-95",
            isOpen ? "block" : "hidden",
          )}>
          <CommandList className={"rounded-lg ring-1 ring-slate-200"}>
            {isLoading && (
              <Command.Loading>
                <div className="p-1">
                  <Skeleton className="h-8 w-full" />
                </div>
              </Command.Loading>
            )}
            <CommandGroup>
              {list.map((v) => {
                const isSelected = selected?.value === v.value;
                return (
                  <Item
                    key={v.value}
                    option={v}
                    isSelected={isSelected}
                    onSelect={handleSelectOption}
                    onRemove={removeOption}
                  />
                );
              })}
            </CommandGroup>
            <Command.Empty
              ref={emptyRef}
              className="select-none rounded-sm px-2 py-3 text-center text-sm">
              {emptyMessage}
            </Command.Empty>
          </CommandList>
        </div>
      </div>
    </Command>
  );
};

type ItemProps = {
  option: Option;
  isSelected: boolean;
  onSelect: (option: Option) => void;
  onRemove?: (value: string) => void;
};

const Item = ({ option, isSelected, onSelect, onRemove }: ItemProps) => {
  const handleSelect = useCallback(
    (_: string) => {
      onSelect(option);
    },
    [onSelect, option],
  );

  const handleMouseDown = useCallback((event: MouseEvent<Element>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleRemove = useCallback(
    (event: MouseEvent<Element>) => {
      event.preventDefault();
      event.stopPropagation();
      onRemove?.(option.value);
    },
    [onRemove, option.value],
  );

  return (
    <CommandItem
      value={option.label}
      onMouseDown={handleMouseDown}
      onSelect={handleSelect}
      className={cn("flex w-full items-center gap-2", !isSelected && "pl-8")}>
      {isSelected && <Check className="w-4" />}
      {option.label}
      {onRemove && (
        <CommandShortcut>
          <Close className="mr-2 h-4 w-4" onClick={handleRemove} />
        </CommandShortcut>
      )}
    </CommandItem>
  );
};
