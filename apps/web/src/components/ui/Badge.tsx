import React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'gold' | 'success' | 'warning' | 'destructive' | 'neutral'
  size?: 'sm' | 'md'
  dot?: boolean
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center font-sans font-medium rounded-full border transition-colors select-none'

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  }

  const variantStyles = {
    primary: 'bg-[#fbe6e9] text-[#6f0617] border-[#f8cfd5]',
    gold: 'bg-[#fdfaf2] text-[#8f6024] border-[#f6e6be]',
    success: 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]',
    warning: 'bg-[#fffbeb] text-[#92400e] border-[#fde68a]',
    destructive: 'bg-[#fef2f2] text-[#a5172a] border-[#fecaca]',
    neutral: 'bg-[#faf9f6] text-[#4b030e]/70 border-[#e6bd81]/50',
  }

  const dotStyles = {
    primary: 'bg-[#6f0617]',
    gold: 'bg-[#b88444]',
    success: 'bg-[#16a34a]',
    warning: 'bg-[#d97706]',
    destructive: 'bg-[#a5172a]',
    neutral: 'bg-[#4b030e]/50',
  }

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[variant]}`} />}
      {children}
    </span>
  )
}
