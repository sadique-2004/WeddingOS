import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, leftIcon, rightIcon, className = '', id, disabled, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id || generatedId

    return (
      <div className="w-full flex flex-col gap-1.5 font-sans">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs sm:text-sm font-medium text-[#4b030e] tracking-tight flex items-center justify-between"
          >
            <span>{label}</span>
            {props.required && <span className="text-[#a5172a] text-xs">* Required</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#4b030e]/50">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={`w-full h-11 px-3.5 rounded-lg border bg-white text-[#4b030e] placeholder:text-[#4b030e]/40 text-sm transition-all duration-200 outline-none ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon ? 'pr-10' : ''} ${
              error
                ? 'border-[#a5172a] focus:ring-2 focus:ring-[#a5172a]/20 focus:border-[#a5172a]'
                : 'border-[#e6bd81] focus:ring-2 focus:ring-[#6f0617]/15 focus:border-[#6f0617]'
            } disabled:bg-[#faf9f6] disabled:text-[#4b030e]/40 disabled:cursor-not-allowed shadow-2xs ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-[#4b030e]/50">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs text-[#a5172a] font-medium mt-0.5">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#4b030e]/60 mt-0.5">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'
