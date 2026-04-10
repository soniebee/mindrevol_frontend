import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="w-full mb-[15px] text-left font-sans">
        {label && (
          <label className="block text-[0.95rem] font-bold text-[#1A1A1A] mb-2 px-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          <input
            type={type}
            className={cn(
              "w-full px-6 py-4 text-[1rem] font-semibold bg-white border-2 border-transparent rounded-[24px] box-border outline-none transition-all duration-300",
              "text-[#1A1A1A] placeholder:text-[#A09D9A]",
              "shadow-[0_8px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.05)] hover:-translate-y-[1px]",
              "focus:border-[#D6CFC7] focus:shadow-[0_4px_12px_rgba(0,0,0,0.02)] focus:-translate-y-[1px] focus:bg-white focus:ring-0",
              "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-[0_8px_20px_rgba(0,0,0,0.03)] disabled:bg-[#FAFAFA]",
              error && "border-red-300 bg-red-50 focus:border-red-400 focus:shadow-[0_4px_12px_rgba(239,68,68,0.1)]",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        
        {error && <p className="text-sm text-red-500 font-bold mt-2 px-2">{error}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }