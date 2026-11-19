import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface AsciiFrameProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function AsciiFrame({ label, children, className }: AsciiFrameProps) {
  return (
    <div className={cn("border border-line-strong bg-background p-4", className)}>
      <div className="mb-3 flex items-center justify-between border-b border-line pb-2 font-mono text-xs tracking-wider text-muted uppercase">
        <span>+--- [ {label} ]</span>
        <span aria-hidden="true">---+</span>
      </div>
      <div>{children}</div>
      <div
        aria-hidden="true"
        className="mt-3 border-t border-line pt-2 font-mono text-xs text-muted"
      >
        +----------------------------------+
      </div>
    </div>
  );
}
