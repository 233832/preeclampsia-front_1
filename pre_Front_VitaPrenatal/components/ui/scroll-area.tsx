'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

function ScrollArea({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="scroll-area"
      className={cn('overflow-auto', className)}
      {...props}
    >
      {children}
    </div>
  )
}

function ScrollBar({
  className,
  orientation = 'vertical',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { orientation?: 'vertical' | 'horizontal' }) {
  return (
    <div
      data-slot="scroll-area-scrollbar"
      className={cn(
        'bg-border/20',
        orientation === 'vertical' ? 'w-2.5 h-full' : 'h-2.5 w-full',
        className,
      )}
      {...props}
    />
  )
}

export { ScrollArea, ScrollBar }

