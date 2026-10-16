import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'gold' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // Base styles: 4px grid spacing, smooth transition (150-250ms), focus ring, Inter font
    const baseStyles =
      'inline-flex items-center justify-center font-medium font-sans rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none'

    // Sizes (44px standard height for md)
    const sizeStyles = {
      sm: 'h-9 px-3 text-xs gap-1.5',
      md: 'h-11 px-5 text-sm gap-2',
      lg: 'h-13 px-7 text-base gap-2.5',
    }

    // Semantic variant styling adhering to docs/DESIGN_SYSTEM.md
    const variantStyles = {
      primary:
        'bg-[#6f0617] text-white hover:bg-[#580a1a] active:bg-[#4b030e] focus:ring-[#a5172a] shadow-sm',
      secondary:
        'bg-white text-[#4b030e] border border-[#e6bd81] hover:bg-[#faf9f6] hover:border-[#b88444] focus:ring-[#b88444] shadow-xs',
      outline:
        'bg-transparent text-[#6f0617] border border-[#6f0617] hover:bg-[#fdf2f4] focus:ring-[#6f0617]',
      gold:
        'bg-[#e6bd81] text-[#4b030e] hover:bg-[#d8ae70] active:bg-[#b88444] focus:ring-[#b88444] font-semibold shadow-sm',
      ghost:
        'bg-transparent text-[#4b030e] hover:bg-[#fbe6e9]/60 hover:text-[#6f0617] focus:ring-[#a5172a]',
      destructive:
        'bg-[#a5172a] text-white hover:bg-[#880e1f] active:bg-[#4b030e] focus:ring-[#a5172a] shadow-sm',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
