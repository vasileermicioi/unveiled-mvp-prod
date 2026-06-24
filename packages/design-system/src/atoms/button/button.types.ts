import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

import type { buttonVariants } from "./button";

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
  };
