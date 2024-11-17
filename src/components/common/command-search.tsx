import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Command } from "cmdk";
import { zodResolver } from "@hookform/resolvers/zod";

import { Settings, Trash, User as UserIcon } from "@/components/common/icons";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Form } from "@/components/ui/form";
// import { Source } from "@/config/constant";
import { log } from "@/lib";
import { User } from "@/service/douyin";

enum Fields {
  User = "user",
}

const FormSchema = z.object({
  [Fields.User]: z.string({
    required_error: "用户为必填字段",
  }),
});

type CommandSearchProps = {
  users: User[];
  handleSelectUser: (user: User) => void;
  handleAddUser: (user: User) => void;
  handleRemoveUser: (user: User) => void;
};

export function CommandSearch({
  users,
  handleSelectUser,
  // handleAddUser,
  handleRemoveUser,
}: CommandSearchProps) {
  const [open, setOpen] = React.useState(false);
  // const [openDropdown, setOpenDropdown] = React.useState(false);

  const methods = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      [Fields.User]: "",
    },
  });

  const { register } = methods;

  const { onChange, onBlur, name, ref } = register(Fields.User);

  const handleChange = (val: string) => {
    log.debug("handleChange", val);
    // const target = { value: val };
    // onChange({ target });
  };

  React.useEffect(() => {
    const func = (e: KeyboardEvent) => {
      // NOTE: 不能在方法体顶部阻止默认行为，会阻止输入事件导致无法输入
      // e.preventDefault();
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      // if (open && e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      //   e.preventDefault();
      //   log.debug("enter");
      //   handleSubmit(onSubmit)();
      // }
    };
    document.addEventListener("keydown", func);
    return () => document.removeEventListener("keydown", func);
  }, []);

  // function onSubmit(data: z.infer<typeof FormSchema>) {
  //   log.debug("onSubmit", data);
  //   handleEnter(data[Fields.User]);
  // }

  // const handleEnter = (value: string) => {
  //   // 使用正则表达式从 value 中提取 uid
  //   // let value = "https://www.douyin.com/user/MS4wLjABAAAAeXRXYRMgC1IRI3VqFFhjTFYEC8JQTZKhUwSZpeKIy_lNiAOKlk91J_YMkL0R6DCR?from_tab_name=main&vid=7409251962430016778"
  //   setOpen(false);
  //   // const uidRegex = /(?:.*)douyin.com\/user\/?([-\w]+)(?:.*)/;
  //   const uidRegex = /(?:.*)douyin.com\/user\/?([-\w]+)/;
  //   const match = value.match(uidRegex);
  //   const uid = match ? match[1] : "";
  //   if (!uid) {
  //     return;
  //   }
  //   let user = users.find((user) => user.uid === uid);
  //   if (!user) {
  //     user = {
  //       uid,
  //       nickname: value,
  //       source: Source.Douyin,
  //       avatar: "",
  //       video_count: 0,
  //     };
  //     handleAddUser(user);
  //   }
  //   handleSelectUser(user);
  // };

  // const handleKeyDown = React.useCallback(
  //   (event: React.KeyboardEvent<HTMLDivElement>) => {
  //     const input = inputRef.current;
  //     log.debug("input", input?.value);
  //     if (!input) {
  //       return;
  //     }

  //     // Keep the options displayed when the user is typing
  //     if (!openDropdown) {
  //       setOpenDropdown(true);
  //     }

  //     // This is not a default behaviour of the <input /> field
  //     if (event.key === "Enter" && input.value !== "") {
  //       const optionToSelect = users.find((option) => option.uid === input.value);
  //       log.debug("Enter input", input?.value, optionToSelect);
  //       if (optionToSelect) {
  //         setSelected(optionToSelect);
  //         onValueChange?.(optionToSelect);
  //       }
  //     }

  //     if (event.key === "Escape") {
  //       input.blur();
  //     }
  //   },
  //   [isOpen, options, onValueChange],
  // );

  return (
    <>
      <p className="text-sm text-muted-foreground">
        Press{" "}
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>J
        </kbd>
      </p>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Form {...methods}>
          <form className="space-y-6">
            <Command>
              <CommandInput
                ref={ref}
                name={name}
                onBlur={onBlur}
                onInput={onChange}
                onValueChange={handleChange}
                placeholder="输入抖音用户链接，例如: www.douyin.com/user/......"
              />
              {/* 去掉 CommandList 的 margin-top */}
              <CommandList style={{ marginTop: 0 }}>
                <CommandEmpty>No results found.</CommandEmpty>
                {/* 去掉 CommandGroup 的 padding-top */}
                <CommandGroup heading="History" className="pt-0">
                  {users.map((user) => (
                    <UserItem key={user.uid} {...{ user, handleSelectUser, handleRemoveUser }} />
                  ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Settings">
                  <CommandItem>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                    <CommandShortcut>⌘P</CommandShortcut>
                  </CommandItem>
                  <CommandItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                    <CommandShortcut>⌘S</CommandShortcut>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </form>
        </Form>
      </CommandDialog>
    </>
  );
}

function UserItem({
  user,
  handleSelectUser,
  handleRemoveUser,
}: {
  user: User;
  handleSelectUser: (user: User) => void;
  handleRemoveUser: (user: User) => void;
}) {
  const handleSelect = () => {
    handleSelectUser(user);
  };

  const handleRemove = () => {
    handleRemoveUser(user);
  };

  return (
    <CommandItem key={user.uid} onClick={handleSelect}>
      <UserIcon className="mr-2 h-4 w-4" />
      <span>{user.nickname}</span>
      <CommandShortcut>
        <Trash className="mr-2 h-4 w-4" onClick={handleRemove} />
      </CommandShortcut>
    </CommandItem>
  );
}
