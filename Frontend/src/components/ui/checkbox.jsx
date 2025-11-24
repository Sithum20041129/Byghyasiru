import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef(({ className, checked, onChange, ...props }, ref) => {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      ref={ref}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        "border-orange-300 focus:border-orange-500 focus:ring-orange-200",
        checked && "bg-orange-500 border-orange-500",
        className
      )}
      onClick={() => onChange?.(!checked)}
      {...props}
    >
      {checked && (
        <Check className="h-3 w-3 text-white" />
      )}
    </button>
  );
});

Checkbox.displayName = "Checkbox";

export { Checkbox };