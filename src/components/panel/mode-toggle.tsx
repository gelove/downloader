import { Moon, Sun } from "@/components/common/icons";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/use-theme";
import { Theme } from "@/config/constant";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const clickHandler = () => {
    setTheme(theme === Theme.Dark ? Theme.Light : Theme.Dark);
  };

  return (
    <TooltipProvider disableHoverableContent>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Button
            className="h-8 w-8 rounded-full bg-background"
            variant="outline"
            size="icon"
            onClick={clickHandler}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-transform duration-500 ease-in-out dark:rotate-0 dark:scale-100" />
            <Moon className="scale-1000 absolute h-[1.2rem] w-[1.2rem] rotate-0 transition-transform duration-500 ease-in-out dark:-rotate-90 dark:scale-0" />
            <span className="sr-only">切换主题</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">切换主题</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
