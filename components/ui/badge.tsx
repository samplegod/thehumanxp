import * as React from "react";

import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-primary/25 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]",
        className,
      )}
      {...props}
    />
  );
}
