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
          <label className="text-base font-normal text-red-950 ml-2">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            // Base styles: bo tròn sâu, bóng đổ, font Jua
            "flex h-14 w-full rounded-2xl bg-white px-5 py-3 text-lg transition-all duration-200 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 font-sans",
            "shadow-[0px_2px_4px_0px_rgba(0,0,0,0.1)] border border-neutral-100",
            "text-stone-700 placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-blue-300",
            error && "border-red-400 focus-visible:ring-red-400 bg-red-50",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-sm text-red-500 font-normal ml-2">{error}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }