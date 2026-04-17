'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

type AlertDialogContextType = {
  open: boolean
  setOpen: (open: boolean) => void
}

const AlertDialogContext = React.createContext<AlertDialogContextType | null>(null)

function AlertDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)

  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  )
}

function AlertDialogTrigger({
  children,
  asChild = false,
  ...props
}: React.HTMLAttributes<HTMLElement> & { asChild?: boolean; children: React.ReactNode }) {
  const context = React.useContext(AlertDialogContext)
  if (!context) return null

  const child = React.Children.only(children) as React.ReactElement

  const handleClick = (event: React.MouseEvent) => {
    child.props.onClick?.(event)
    context.setOpen(true)
  }

  if (asChild && React.isValidElement(child)) {
    return React.cloneElement(child, {
      ...props,
      ...child.props,
      onClick: handleClick,
    })
  }

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  )
}

function AlertDialogOverlay({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(AlertDialogContext)
  if (!context || !context.open) return null

  return (
    <div
      data-slot="alert-dialog-overlay"
      className={cn('fixed inset-0 z-50 bg-black/50', className)}
      onClick={() => context.setOpen(false)}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(AlertDialogContext)
  if (!context || !context.open) return null

  const stopPropagation = (event: React.MouseEvent) => event.stopPropagation()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <AlertDialogOverlay />
      <div
        data-slot="alert-dialog-content"
        className={cn(
          'relative z-50 w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg whitespace-normal break-words',
          className,
        )}
        onClick={stopPropagation}
        {...props}
      >
        {children}
      </div>
    </div>
  )
}

function AlertDialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  )
}

function AlertDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn('mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}

function AlertDialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      data-slot="alert-dialog-title"
      className={cn('text-lg font-semibold', className)}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="alert-dialog-description"
      className={cn('text-muted-foreground text-sm leading-relaxed whitespace-normal break-words', className)}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(AlertDialogContext)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    context?.setOpen(false)
  }

  return (
    <button
      type="button"
      className={cn(buttonVariants(), className)}
      onClick={handleClick}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(AlertDialogContext)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    context?.setOpen(false)
  }

  return (
    <button
      type="button"
      className={cn(buttonVariants({ variant: 'outline' }), className)}
      onClick={handleClick}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
