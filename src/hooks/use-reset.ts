import { useTheme } from "@/hooks/use-theme";

// 清除缓存
export const useReset = () => {
  const { resetTheme } = useTheme();

  const reset = () => {
    resetTheme();
  };

  return { reset };
};
