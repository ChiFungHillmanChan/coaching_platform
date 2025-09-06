import * as React from 'react'
import { cn } from '@/lib/utils'

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {}

const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <kbd
        ref={ref}
        className={cn('kbd', className)}
        {...props}
      >
        {children}
      </kbd>
    )
  }
)
Kbd.displayName = 'Kbd'

export { Kbd }