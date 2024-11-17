import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { CollapseMenuButton } from "@/components/panel/collapse-menu-button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { getMenuList } from "@/config/menu-list";
import { cn } from "@/lib/utils";
import { Ellipsis } from "@/components/common/icons";

interface MenuProps {
  isOpen: boolean;
}

export function Menu({ isOpen }: MenuProps) {
  const { pathname } = useLocation();
  const menuList = getMenuList(pathname);

  return (
    <nav className="mt-8 h-full w-full">
      <ul className="flex flex-grow flex-col items-start space-y-1 px-2">
        {menuList.map(({ groupLabel, menus }, index) => (
          <li className={cn("w-full", groupLabel ? "pt-5" : "")} key={index}>
            {isOpen && groupLabel ? (
              <p className="max-w-[248px] truncate px-4 pb-2 text-sm font-medium text-muted-foreground">
                {groupLabel}
              </p>
            ) : !isOpen && groupLabel ? (
              <TooltipProvider>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger className="w-full">
                    <div className="flex w-full items-center justify-center">
                      <Ellipsis className="h-5 w-5" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{groupLabel}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <p className="pb-2"></p>
            )}
            {menus.map(({ href, label, icon: Icon, active, submenus }, index) =>
              submenus.length === 0 ? (
                <div className="w-full" key={index}>
                  <TooltipProvider disableHoverableContent>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={active ? "secondary" : "ghost"}
                          className="mb-1 h-10 w-full justify-start"
                          asChild>
                          <Link to={href} state={{ label }}>
                            <span className={cn(!isOpen ? "" : "mr-4")}>
                              <Icon size={18} />
                            </span>
                            <p
                              className={cn(
                                "max-w-[200px] truncate",
                                !isOpen ? "-translate-x-96 opacity-0" : "translate-x-0 opacity-100",
                              )}>
                              {label}
                            </p>
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      {!isOpen && <TooltipContent side="right">{label}</TooltipContent>}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ) : (
                <div className="w-full" key={index}>
                  <CollapseMenuButton
                    icon={Icon}
                    label={label}
                    active={active}
                    submenus={submenus}
                    isOpen={isOpen}
                  />
                </div>
              ),
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
