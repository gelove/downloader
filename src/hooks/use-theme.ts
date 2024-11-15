import { useAtom } from "jotai";

import { defaultValue, themeAtom } from "@/atoms/theme";

// 相当于 return [theme, setTheme] as const;
// export const useTheme = () => useAtom(themeAtom);

export const useTheme = () => {
  const [theme, setTheme] = useAtom(themeAtom);

  const resetTheme = () => setTheme(defaultValue);

  return { theme, setTheme, resetTheme } as const;
};
