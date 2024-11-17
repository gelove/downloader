import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";
import { appName } from "@/config/constant";
import { Button } from "@/components/ui/button";
import { Menu } from "@/components/panel/menu-new";
import { SidebarToggle } from "@/components/panel/sidebar-toggle";
// import { PanelsTopLeft } from "@/components/common/icons";

export function Sidebar() {
  const {
    sidebar: { isOpen },
    setSidebar,
  } = useSidebar();

  const setIsOpen = () =>
    setSidebar((draft) => {
      draft.isOpen = !draft.isOpen;
    });

  return (
    <aside
      data-tauri-drag-region
      className={cn(
        "fixed left-0 top-0 z-10 h-screen -translate-x-full transition-[width] duration-300 ease-in-out lg:translate-x-0",
        !isOpen ? "w-16" : "w-56",
      )}>
      <SidebarToggle isOpen={isOpen} setIsOpen={setIsOpen} />
      <div
        data-tauri-drag-region
        className="relative flex h-full flex-col px-3 py-4 shadow-md dark:shadow-zinc-800">
        <div data-tauri-drag-region className="flex items-center justify-center">
          <Button
            className={cn(
              "transition-transform duration-300 ease-in-out",
              !isOpen ? "translate-x-1" : "translate-x-0",
            )}
            variant="link"
            asChild>
            <Link to="/" state={{ label: "任务中心" }} className="flex items-center gap-2">
              {/* <PanelsTopLeft className="h-6 w-6" /> */}
              <img src="/logo.png" height={24} width={24} alt="logo" />
              <h1
                className={cn(
                  "whitespace-nowrap text-lg font-bold transition-[transform,opacity,display] duration-300 ease-in-out",
                  !isOpen ? "hidden -translate-x-96 opacity-0" : "translate-x-0 opacity-100",
                )}>
                {appName}
              </h1>
            </Link>
          </Button>
        </div>
        <Menu isOpen={isOpen} />
      </div>
    </aside>
  );
}
