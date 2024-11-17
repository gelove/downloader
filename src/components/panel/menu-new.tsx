import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { CollapseMenuButton } from "@/components/panel/collapse-menu-button-new";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { menuList } from "@/config/menu-list";
import { Ellipsis } from "@/components/common/icons";
import { cn } from "@/lib/utils";
import { isMenuActive } from "@/lib/route";
// import { log } from "@/lib";

interface MenuProps {
  isOpen: boolean;
}

export function Menu({ isOpen }: MenuProps) {
  const { pathname } = useLocation();
  // const menuList = getMenuList(pathname);

  return (
    <nav className="mt-8 h-full w-full">
      <ul className="flex flex-grow flex-col items-start space-y-1 px-1">
        {menuList.map(({ groupLabel, menus }, index) => (
          <li className={cn("w-full", groupLabel ? "pt-2" : "")} key={index}>
            {groupLabel && isOpen && (
              <p className="max-w-[248px] truncate px-4 py-2 text-sm font-medium text-muted-foreground">
                {groupLabel}
              </p>
            )}
            {groupLabel && !isOpen && (
              <TooltipProvider>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger className="w-full border-0 py-2">
                    <div className="flex w-full items-center justify-center">
                      <Ellipsis className="h-5 w-5" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="py-1">
                    <p>{groupLabel}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {menus.map(({ href, label, icon: Icon, submenus }, index) => {
              const isActive = isMenuActive(pathname, href);
              // log.debug(label, isActive, pathname, href);
              return submenus.length === 0 ? (
                <div className="w-full" key={index}>
                  <TooltipProvider disableHoverableContent>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          className="mb-1 h-10 w-full justify-start p-2"
                          asChild>
                          <Link to={href} state={{ label }}>
                            <span className={!isOpen ? "" : "mr-4"}>
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
                      {!isOpen && (
                        <TooltipContent side="right" className="">
                          {label}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ) : (
                <div className="w-full" key={index}>
                  <CollapseMenuButton
                    icon={Icon}
                    label={label}
                    pathname={pathname}
                    active={isActive}
                    submenus={submenus}
                    isOpen={isOpen}
                  />
                </div>
              );
            })}
          </li>
        ))}
      </ul>
    </nav>
  );
}
