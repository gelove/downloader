import { useState } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { DayPicker as DayPickerBase, PropsSingle } from "react-day-picker";
import "react-day-picker/style.css";

import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "@/components/common/icons";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@/components/ui";

export type DatePickerProps = PropsSingle & {
  label?: string;
  onSelect?: (date?: Date) => void;
};

export { type PropsSingle };

/**
 * @param label
 * @param selected
 * @param props
 * @constructor
 */
export function DatePicker({ label = "选择日期", selected, onSelect, ...props }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDaySelect = (date?: Date) => {
    onSelect?.(date);
    setIsOpen(false); // 选择日期后关闭 Popover
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !selected && "text-muted-foreground",
          )}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, "yyyy-MM-dd") : <span>{label}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <DayPickerBase
          autoFocus
          showOutsideDays
          hideNavigation
          captionLayout="dropdown"
          locale={zhCN}
          selected={selected}
          onSelect={handleDaySelect}
          // footer={selected !== undefined && `Selected: ${selected.toDateString()}`}
          {...props}
        />
      </PopoverContent>
    </Popover>
  );
}
