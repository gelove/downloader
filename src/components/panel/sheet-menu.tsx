import { Link } from "react-router-dom";

import { Menu } from "@/components/panel/menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { appName } from "@/config/constant";
import { Menu as MenuIcon, PanelsTopLeft } from "@/components/common/icons";

export function SheetMenu() {
  return (
    <Sheet>
      <SheetTrigger className="lg:hidden" asChild>
        <Button className="h-8" variant="outline" size="icon">
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex h-full flex-col px-3 sm:w-72" side="left">
        <SheetHeader>
          <Button className="flex items-center justify-center pb-2 pt-1" variant="link" asChild>
            <Link to="/" state={{ label: "任务中心" }} className="flex items-center gap-2">
              <PanelsTopLeft className="mr-1 h-6 w-6" />
              <SheetTitle className="text-lg font-bold">{appName}</SheetTitle>
            </Link>
          </Button>
        </SheetHeader>
        <Menu isOpen />
      </SheetContent>
    </Sheet>
  );
}
