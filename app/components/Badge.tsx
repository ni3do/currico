import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "accent" | "success" | "warning" | "error";
  size?: "sm" | "md";
  className?: string;
}

export default function Badge({
  children,
  variant = "primary",
  size = "md",
  className = "",
}: BadgeProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-full transition-colors";

  const variants = {
    primary: "bg-[--primary]/10 text-[--primary] border border-[--primary]/20",
    secondary:
      "bg-[--secondary]/10 text-[--secondary] border border-[--secondary]/20",
    accent: "bg-[--accent]/10 text-[--accent] border border-[--accent]/20",
    success: "bg-[--success]/10 text-[--success] border border-[--success]/20",
    warning: "bg-[--warning]/10 text-[--warning] border border-[--warning]/20",
    error: "bg-[--error]/10 text-[--error] border border-[--error]/20",
  };

  const sizes = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-4 py-1.5 text-sm",
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return <span className={classes}>{children}</span>;
}
