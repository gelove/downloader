import {
  Icon,
  Tiktok,
  LayoutGrid,
  Settings,
  Clapperboard,
  Music4,
  // SquarePen,
} from "@/components/common/icons";

export type Submenu = {
  href: string;
  label: string;
  active: boolean;
};

export type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: Icon;
  submenus: Submenu[];
};

export type Group = {
  groupLabel: string;
  menus: Menu[];
};

export const menuList: Group[] = [
  {
    groupLabel: "",
    menus: [
      {
        href: "/",
        label: "任务中心",
        active: false,
        icon: LayoutGrid,
        submenus: [],
      },
    ],
  },
  {
    groupLabel: "Video",
    menus: [
      {
        href: "/video/douyin",
        label: "抖音",
        active: false,
        icon: Tiktok,
        submenus: [],
      },
      // {
      //   href: "/video/tiktok",
      //   label: "Tiktok",
      //   active: false,
      //   icon: Tiktok,
      //   submenus: [],
      // },
    ],
  },
  {
    groupLabel: "Tools",
    menus: [
      // {
      //   href: "/tools/media",
      //   label: "音视频处理",
      //   active: false,
      //   icon: Clapperboard,
      //   submenus: [],
      // },
      {
        href: "/tools/video",
        label: "视视处理",
        active: false,
        icon: Clapperboard,
        submenus: [],
      },
      {
        href: "/tools/audio",
        label: "音频处理",
        active: false,
        icon: Music4,
        submenus: [],
      },
    ],
  },
  {
    groupLabel: "Setting",
    menus: [
      {
        href: "/setting/config",
        label: "设置",
        active: false,
        icon: Settings,
        submenus: [],
      },
      // {
      //   href: "/setting/user",
      //   label: "用户",
      //   active: false,
      //   icon: Users,
      //   submenus: [],
      // },
    ],
  },
  // {
  //   groupLabel: "Example",
  //   menus: [
  //     {
  //       href: "/example/react-query",
  //       label: "react-query",
  //       active: false,
  //       icon: SquarePen,
  //       submenus: [],
  //     },
  //     {
  //       href: "/example/jotai-query",
  //       label: "jotai-query",
  //       active: false,
  //       icon: SquarePen,
  //       submenus: [],
  //     },
  //     {
  //       href: "/example/react-virtual",
  //       label: "react-virtual",
  //       active: false,
  //       icon: SquarePen,
  //       submenus: [
  //         {
  //           href: "/example/react-virtual/grid",
  //           label: "网格",
  //           active: false,
  //         },
  //         {
  //           href: "/example/react-virtual/infinite",
  //           label: "无限列表",
  //           active: false,
  //         },
  //       ],
  //     },
  //   ],
  // },
];

export function getMenuList(pathname: string): Group[] {
  return menuList.map((group) => {
    return {
      ...group,
      menus: group.menus.map((menu) => {
        return {
          ...menu,
          active: pathname.includes(menu.href),
          submenus: menu.submenus.map((submenu) => {
            return {
              ...submenu,
              active: pathname === submenu.href,
            };
          }),
        };
      }),
    };
  });
}
