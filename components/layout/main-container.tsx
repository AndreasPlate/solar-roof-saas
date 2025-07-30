import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface MainContainerProps {
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full'
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',     // 640px
  md: 'max-w-screen-md',     // 768px
  lg: 'max-w-screen-lg',     // 1024px
  xl: 'max-w-screen-xl',     // 1280px
  '2xl': 'max-w-screen-2xl', // 1536px
  '3xl': 'max-w-[1600px]',
  '4xl': 'max-w-[1800px]',
  '5xl': 'max-w-[2000px]',
  '6xl': 'max-w-[2200px]',
  '7xl': 'max-w-[2400px]',
  full: 'max-w-full'
}

// MainContainer is a pure horizontal centering wrapper. No padding or margin is applied here.
export function MainContainer({ children, className, maxWidth = "xl" }: MainContainerProps) {
  return (
    <div className={cn(maxWidthClasses[maxWidth], "mx-auto", className)}>
      {children}
    </div>
  )
}