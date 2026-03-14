import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-300">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            // Base styles
            "flex h-12 w-full rounded-xl border px-4 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            
            // Light Mode colors (Fallback)
            "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2",
            
            // Dark Mode colors (Chủ đạo)
            "dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus-visible:border-[#FFF5C0] dark:focus-visible:ring-0 dark:focus-visible:bg-zinc-900",
            
            // Error state
            error && "border-red-500 focus-visible:ring-red-500 dark:border-red-500",
            
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-red-500 font-medium ml-1">{error}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }