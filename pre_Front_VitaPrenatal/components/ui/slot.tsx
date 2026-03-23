import * as React from 'react'
import { cn } from '@/lib/utils'

type SlotProps = React.HTMLAttributes<HTMLElement> & {
  children: React.ReactElement
}

function Slot({ children, className, ...props }: SlotProps) {
  if (!React.isValidElement(children)) {
    return null
  }

  const mergedClassName = cn(children.props.className, className)

  return React.cloneElement(children, {
    ...props,
    ...children.props,
    className: mergedClassName,
  })
}

export { Slot }
