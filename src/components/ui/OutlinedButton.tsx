import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface OutlinedButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export function OutlinedButton({
  className,
  children,
  label,
  type = "button",
  ...props
}: OutlinedButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center border border-line bg-background px-4 py-2 font-mono text-xs tracking-wider text-ink uppercase transition-colors hover:border-ink hover:bg-ink hover:text-background focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children ?? label}
    </button>
  );
}
