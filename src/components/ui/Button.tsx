import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center whitespace-nowrap font-sans transition-all duration-300 ease-out focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#2B2A29] text-white font-extrabold rounded-[24px] shadow-[0_10px_25px_rgba(43,42,41,0.2)] hover:shadow-[0_15px_35px_rgba(43,42,41,0.25)] hover:-translate-y-[2px] active:scale-[0.97] active:shadow-[0_5px_15px_rgba(43,42,41,0.15)] active:translate-y-0 border-none",
        destructive: "bg-red-500 text-white font-extrabold rounded-[24px] shadow-[0_10px_25px_rgba(239,68,68,0.2)] hover:shadow-[0_15px_35px_rgba(239,68,68,0.25)] hover:-translate-y-[2px] active:scale-[0.97] active:shadow-[0_5px_15px_rgba(239,68,68,0.15)] active:translate-y-0 border-none",
        outline: "bg-white text-[#1A1A1A] font-extrabold border-2 border-transparent hover:border-[#D6CFC7] rounded-[24px] shadow-[0_8px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.05)] hover:-translate-y-[1px] active:scale-[0.97] active:translate-y-0 active:shadow-[0_4px_12px_rgba(0,0,0,0.02)]",
        secondary: "bg-[#F4EBE1] text-[#2B2A29] font-extrabold rounded-[24px] shadow-[0_8px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.05)] hover:-translate-y-[1px] active:scale-[0.97] active:translate-y-0 active:shadow-[0_4px_12px_rgba(0,0,0,0.02)] border-none",
        ghost: "hover:bg-gray-100 text-[#1A1A1A] font-bold rounded-[24px] active:scale-[0.97]",
        link: "text-[#1A1A1A] font-bold border-b-2 border-transparent hover:border-[#2B2A29] rounded-none pb-0 px-1 inline-flex h-auto w-auto active:scale-[0.97]",
      },
      size: {
        default: "h-[54px] px-6 py-2 text-[1.1rem]", 
        sm: "h-11 px-4 text-[0.95rem] rounded-[18px]",
        lg: "h-16 px-8 text-[1.2rem] rounded-[28px]",
        icon: "h-14 w-14 rounded-[24px]",
      },
      isLoading: {
        true: "cursor-wait opacity-80",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, isLoading, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }