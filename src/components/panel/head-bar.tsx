import { UserNav } from "@/components/panel/user-nav";
import { SheetMenu } from "@/components/panel/sheet-menu";
// import { ThemeToggle } from "@/components/panel/theme-toggle";
import { ModeToggle } from "@/components/panel/mode-toggle";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header
      data-tauri-drag-region
      className="z-1 sticky top-0 h-14 w-full cursor-default bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
      <div data-tauri-drag-region className="mx-4 flex h-full items-center sm:mx-8">
        <div className="flex items-center space-x-4 lg:space-x-0">
          <SheetMenu />
          <h1 className="font-bold">{title}</h1>
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center justify-end space-x-2">
          <ModeToggle />
          {/* <ThemeToggle /> */}
          <UserNav />
        </div>
      </div>
    </header>
  );
}
