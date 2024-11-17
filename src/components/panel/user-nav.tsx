import { Link } from "react-router-dom";
import { useAtom } from "jotai";

import { LayoutGrid, LogOut } from "@/components/common/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { accountAtom } from "@/atoms/account";

export function UserNav() {
  const [account] = useAtom(accountAtom);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={account.avatarUrl} alt="Avatar" />
            <AvatarFallback className="bg-transparent">{account.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{account.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{account.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link to="/" state={{ label: "任务中心" }} className="flex items-center">
              <LayoutGrid className="mr-3 h-4 w-4 text-muted-foreground" />
              任务中心
            </Link>
          </DropdownMenuItem>
          {/* <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link to="/account" state={{ label: "account" }} className="flex items-center">
              <User className="mr-3 h-4 w-4 text-muted-foreground" />
              账户
            </Link>
          </DropdownMenuItem> */}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="hover:cursor-pointer" onClick={() => {}}>
          <LogOut className="mr-3 h-4 w-4 text-muted-foreground" />
          注销
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
