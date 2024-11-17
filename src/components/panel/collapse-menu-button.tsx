import { useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Icon, ChevronDown, Dot } from "@/components/common/icons";
import { cn } from "@/lib/utils";
import { Submenu } from "@/config/menu-list";

interface CollapseMenuButtonProps {
  icon: Icon;
  label: string;
  active: boolean;
  submenus: Submenu[];
  isOpen: boolean;
}

export function CollapseMenuButton({
  icon: Icon,
  label,
  active,
  submenus,
  isOpen,
}: CollapseMenuButtonProps) {
  const isSubmenuActive = submenus.some((submenu) => submenu.active);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(isSubmenuActive);

  if (isOpen) {
    return (
      <Collapsible open={isCollapsed} onOpenChange={setIsCollapsed} className="w-full">
        <CollapsibleTrigger className="mb-1 [&[data-state=open]>div>div>svg]:rotate-180" asChild>
          <Button variant={active ? "secondary" : "ghost"} className="h-10 w-full justify-start">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center">
                <span className="mr-4">
                  <Icon size={18} />
                </span>
                <p className={cn("max-w-[150px] truncate")}>{label}</p>
              </div>
              <div className={cn("whitespace-nowrap")}>
                <ChevronDown size={18} className="transition-transform duration-200" />
              </div>
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          {submenus.map(({ href, label, active }, index) => (
            <Button
              key={index}
              variant={active ? "secondary" : "ghost"}
              className="mb-1 h-10 w-full justify-start"
              asChild>
              <Link to={href} state={{ label }}>
                <span className="ml-2 mr-4">
                  <Dot size={18} />
                </span>
                <p className={cn("max-w-[170px] truncate")}>{label}</p>
              </Link>
            </Button>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant={active ? "secondary" : "ghost"}
                className="mb-1 h-10 w-full justify-start">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center">
                    <span>
                      <Icon size={18} />
                    </span>
                    <p className={cn("max-w-[200px] truncate", "opacity-0")}>{label}</p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right" align="start" alignOffset={2}>
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent side="right" sideOffset={25} align="start">
        <DropdownMenuLabel className="max-w-[190px] truncate">{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {submenus.map(({ href, label }, index) => (
          <DropdownMenuItem key={index} asChild>
            <Link to={href} state={{ label }} className="cursor-pointer">
              <p className="max-w-[180px] truncate">{label}</p>
            </Link>
          </DropdownMenuItem>
        ))}
        <ChevronDown className="fill-border" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
