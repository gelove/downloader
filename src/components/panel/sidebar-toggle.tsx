import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "@/components/common/icons";

interface SidebarToggleProps {
  isOpen: boolean;
  setIsOpen: () => void;
}

export function SidebarToggle({ isOpen, setIsOpen }: SidebarToggleProps) {
  return (
    <div className="invisible absolute -right-3 top-2 z-10 lg:visible">
      <Button onClick={setIsOpen} className="h-6 w-6 rounded-md" variant="outline" size="icon">
        <ChevronLeft
          className={cn(
            "h-4 w-4 transition-transform duration-700 ease-in-out",
            !isOpen ? "rotate-180" : "rotate-0",
          )}
        />
      </Button>
    </div>
  );
}
