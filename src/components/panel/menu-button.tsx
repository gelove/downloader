import { Link } from "react-router-dom";

import { Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/common/icons";

interface MenuButtonProps {
  icon: Icon;
  href: string;
  label: string;
  active: boolean;
}

export function MenuButton({ icon: Icon, href, label, active }: MenuButtonProps) {
  return (
    <TooltipProvider disableHoverableContent>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Button
            variant={active ? "secondary" : "ghost"}
            className="mb-1 h-10 w-full justify-start"
            asChild>
            <Link to={href} state={{ label }}>
              <span className="mr-4">
                <Icon size={18} />
              </span>
              <p className={cn("max-w-[200px] truncate")}>{label}</p>
            </Link>
          </Button>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  );
}
