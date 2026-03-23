'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

type DialogContextType = {
  onOpenChange: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextType | null>(null)

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <DialogContext.Provider value={{ onOpenChange }}>
      {open ? <>{children}</> : null}
    </DialogContext.Provider>
  )
}

function DialogTrigger({
  children,
  asChild = false,
  ...props
}: React.HTMLAttributes<HTMLElement> & { asChild?: boolean; children: React.ReactNode }) {
  const context = React.useContext(DialogContext)
  const child = React.Children.only(children) as React.ReactElement

  if (!context) {
    return null
  }

  const handleClick = (event: React.MouseEvent) => {
    if (child.props.onClick) {
      ;(child.props.onClick as React.MouseEventHandler)(event)
    }
    context.onOpenChange(true)
  }

  if (asChild && React.isValidElement(child)) {
    return React.cloneElement(child, {
      ...props,
      ...child.props,
      onClick: handleClick,
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      {...props}
      className={cn('cursor-pointer', props.className)}
    >
      {children}
    </button>
  )
}

function DialogOverlay({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(DialogContext)

  if (!context) return null

  return (
    <div
      data-slot="dialog-overlay"
      className={cn('fixed inset-0 z-40 bg-black/50', className)}
      onClick={() => context.onOpenChange(false)}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  onClose,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { onClose?: () => void }) {
  const context = React.useContext(DialogContext)

  if (!context) return null

  const handleOuterClick = () => {
    context.onOpenChange(false)
    onClose?.()
  }

  const handleContentClick = (event: React.MouseEvent) => {
    event.stopPropagation()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <DialogOverlay />
      <div
        data-slot="dialog-content"
        className={cn(
          'relative z-50 w-full max-w-lg overflow-y-auto rounded-lg border bg-background p-6 shadow-lg outline-none',
          className,
        )}
        onClick={handleContentClick}
        {...props}
      >
        {children}
      </div>
    </div>
  )
}

function DialogClose({
  className,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(DialogContext)

  if (!context) return null

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    context.onOpenChange(false)
  }

  return (
    <button
      type="button"
      data-slot="dialog-close"
      className={cn('absolute top-4 right-4 text-muted-foreground', className)}
      onClick={handleClick}
      {...props}
    />
  )
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      data-slot="dialog-title"
      className={cn('text-lg leading-none font-semibold', className)}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="dialog-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
}
