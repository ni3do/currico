interface SkeletonProps {
  className?: string;
  variant?: "text" | "card" | "circular" | "rectangular";
}

export default function Skeleton({
  className = "",
  variant = "rectangular",
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-[--surface-elevated]";

  const variants = {
    text: "h-4 rounded",
    card: "h-32 rounded-2xl",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const classes = `${baseClasses} ${variants[variant]} ${className}`;

  return <div className={classes} />;
}
