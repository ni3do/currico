interface TooltipProps {
  text: string;
  position?: "top" | "bottom";
  className?: string;
}

export function Tooltip({ text, position = "top", className = "" }: TooltipProps) {
  const positionClass = position === "top" ? "bottom-full mb-1" : "top-full mt-1";

  return (
    <span
      className={`bg-text text-bg pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 ${positionClass} ${className}`}
    >
      {text}
    </span>
  );
}
