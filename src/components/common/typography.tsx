import { createElement } from "react";
import { cva, VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
      h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      h5: "scroll-m-20 text-xl font-semibold tracking-tight",
      h6: "scroll-m-20 text-xl font-semibold tracking-tight",
      p: "leading-7 [&:not(:first-child)]:mt-6",
      lead: "text-xl text-muted-foreground",
      muted: "text-sm text-muted-foreground",
      code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
      small: "text-sm font-medium leading-none",
      blockquote: "mt-6 border-l-2 pl-6 italic",
    },
  },
  defaultVariants: {
    variant: "p",
  },
});

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {}

type TypographyVariant = VariantProps<typeof typographyVariants>["variant"];

export type ComponentType = Exclude<TypographyVariant, "lead" | "muted" | null | undefined>;

// 创建通用 Typography 组件
export function Typography({ variant, className, ...props }: TypographyProps) {
  // 根据传入的 variant 值选择标签
  const Component: ComponentType =
    variant && !["lead", "muted"].includes(variant) ? (variant as ComponentType) : "p";

  return createElement(Component, {
    className: cn(typographyVariants({ variant, className })),
    ...props,
  });
}
