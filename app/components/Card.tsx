import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  variant?: "default" | "glass" | "elevated";
  hover?: boolean;
  className?: string;
}

export default function Card({
  children,
  variant = "default",
  hover = false,
  className = "",
}: CardProps) {
  const baseClasses = "rounded-2xl transition-all duration-300";

  const variants = {
    default: "bg-[--surface] border border-[--border]",
    glass:
      "bg-[--surface]/60 backdrop-blur-xl border border-[--border]/50 shadow-xl",
    elevated: "bg-[--surface-elevated] border border-[--border] shadow-lg",
  };

  const hoverClasses = hover
    ? "hover:shadow-xl hover:border-[--primary]/50 hover:-translate-y-0.5"
    : "";

  const classes = `${baseClasses} ${variants[variant]} ${hoverClasses} ${className}`;

  return <div className={classes}>{children}</div>;
}
