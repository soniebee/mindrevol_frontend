import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-lg font-normal font-['Jua'] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-blue-800/80 text-white hover:bg-blue-800 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] hover:shadow-[0px_6px_6px_0px_rgba(0,0,0,0.25)]",
        destructive: "bg-red-500/90 text-white hover:bg-red-500 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]",
        outline: "border-2 border-white bg-white/80 hover:bg-white text-blue-950 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.1)]",
        secondary: "bg-neutral-400/80 text-white hover:bg-neutral-500/80 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]",
        ghost: "hover:bg-sky-100/50 text-stone-600 hover:text-blue-950",
        link: "text-blue-800 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-14 px-6 py-2", 
        sm: "h-10 rounded-lg px-4 text-base",
        lg: "h-16 rounded-2xl px-8 text-xl",
        icon: "h-14 w-14",
      },
      isLoading: {
        true: "cursor-not-allowed opacity-70",
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
  isLoading?: boolean
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
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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