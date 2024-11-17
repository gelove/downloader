import { useAtom } from "jotai";

import { defaultValue, sidebarAtom } from "@/atoms/sidebar";

export const useSidebar = () => {
  const [sidebar, setSidebar] = useAtom(sidebarAtom);

  const resetSidebar = () => setSidebar(defaultValue);

  return { sidebar, setSidebar, resetSidebar };
};
