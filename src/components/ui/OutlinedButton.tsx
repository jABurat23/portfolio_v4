import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { OUTLINED_BUTTON_CLASS } from "@/lib/interactive";

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
      className={cn(OUTLINED_BUTTON_CLASS, className)}
      {...props}
    >
      {children ?? label}
    </button>
  );
}
