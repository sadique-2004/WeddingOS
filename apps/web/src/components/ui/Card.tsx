import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', hoverEffect = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-white rounded-xl border border-[#e6bd81]/50 shadow-[0_4px_20px_-2px_rgba(75,3,14,0.04)] text-[#4b030e] ${
          hoverEffect
            ? 'transition-all duration-200 hover:shadow-[0_8px_30px_-4px_rgba(75,3,14,0.08)] hover:border-[#b88444]/60'
            : ''
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = 'Card'

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`px-6 py-5 border-b border-[#e6bd81]/30 flex flex-col gap-1.5 ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)
CardHeader.displayName = 'CardHeader'

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className = '', children, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={`text-lg sm:text-xl font-serif font-semibold text-[#4b030e] leading-snug tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  )
})
CardTitle.displayName = 'CardTitle'

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className = '', children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={`text-xs sm:text-sm text-[#4b030e]/70 font-sans leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </p>
  )
})
CardDescription.displayName = 'CardDescription'

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`px-6 py-5 ${className}`} {...props}>
        {children}
      </div>
    )
  }
)
CardContent.displayName = 'CardContent'

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`px-6 py-4 border-t border-[#e6bd81]/30 bg-[#faf9f6]/50 rounded-b-xl flex items-center justify-between gap-4 ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)
CardFooter.displayName = 'CardFooter'
